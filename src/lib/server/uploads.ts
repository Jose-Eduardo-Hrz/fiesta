/**
 * Servicio de recepción de archivos.
 *
 * Cada archivo llega en su propia petición HTTP con el contenido "crudo" en el
 * cuerpo (no multipart). Así el servidor lo procesa como un stream:
 *
 *   request.body ─► GuardStream (cuenta bytes + revisa firma) ─► almacenamiento
 *
 * En ningún momento el archivo completo está en memoria, por lo que un video
 * de 1 GB consume lo mismo que una foto de 2 MB (unos pocos KB de búfer).
 */
import { Readable, Transform, type TransformCallback } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { UPLOAD_LIMITS, maxBytesFor, type AllowedFileType } from '$lib/config';
import { checkFile } from '$lib/validation';
import { formatBytes } from '$lib/utils/format';
import type { UploadFileResponse } from '$lib/types';
import { SIGNATURE_BYTES, signatureMatches } from './file-signature';
import { sanitizeFileName, tableFolder } from './sanitize';
import { countSubmissionFiles, findFileByClientId, insertFile, type SubmissionRecord } from './db';
import { getStorage } from './storage';
import { PublicError, discardBody } from './http';
import { sign, verifySignature } from './crypto';

const TOKEN_CONTEXT = 'upload-token';
/** Un envío acepta archivos durante 24 h desde que se creó. */
const SUBMISSION_TTL_MS = 24 * 60 * 60 * 1000;
/** Bytes que aceptamos "tirar" tras rechazar un archivo para que el mensaje llegue al celular. */
export const DISCARD_LIMIT = UPLOAD_LIMITS.maxVideoBytes;

export function createUploadToken(submissionId: string): string {
	return sign(TOKEN_CONTEXT, submissionId);
}

export function verifyUploadToken(submissionId: string, token: string | null): boolean {
	return !!token && verifySignature(TOKEN_CONTEXT, submissionId, token);
}

export function assertSubmissionOpen(submission: SubmissionRecord): void {
	if (Date.now() - Date.parse(submission.createdAt) > SUBMISSION_TTL_MS) {
		throw new PublicError(410, 'Esta sesión de envío expiró. Vuelve a la página principal para empezar de nuevo.');
	}
}

/**
 * Transform que:
 *  - retiene los primeros bytes hasta poder verificar la firma del formato,
 *  - corta la subida en cuanto se supera el tamaño máximo,
 *  - detecta subidas truncadas (conexión perdida) comparando con Content-Length.
 */
class GuardStream extends Transform {
	private received = 0;
	private head: Buffer[] = [];
	private headLength = 0;
	private verified = false;

	constructor(
		private readonly type: AllowedFileType,
		private readonly maxBytes: number,
		private readonly expectedBytes: number,
		private readonly displayName: string
	) {
		super();
	}

	override _transform(chunk: Buffer, _enc: BufferEncoding, callback: TransformCallback): void {
		this.received += chunk.length;
		if (this.received > this.maxBytes || this.received > this.expectedBytes) {
			callback(new PublicError(413, `«${this.displayName}» supera el tamaño máximo de ${formatBytes(this.maxBytes)}.`));
			return;
		}
		if (this.verified) {
			callback(null, chunk);
			return;
		}
		this.head.push(chunk);
		this.headLength += chunk.length;
		if (this.headLength >= SIGNATURE_BYTES) {
			this.releaseHead(callback);
		} else {
			callback();
		}
	}

	override _flush(callback: TransformCallback): void {
		if (this.received !== this.expectedBytes) {
			callback(new PublicError(400, `La subida de «${this.displayName}» se interrumpió. Revisa tu conexión e inténtalo otra vez.`));
			return;
		}
		if (!this.verified) {
			this.releaseHead(callback);
			return;
		}
		callback();
	}

	private releaseHead(callback: TransformCallback): void {
		const head = Buffer.concat(this.head);
		this.head = [];
		if (!signatureMatches(this.type.extension, head)) {
			callback(
				new PublicError(415, `«${this.displayName}» no parece ser una foto o video válido.`)
			);
			return;
		}
		this.verified = true;
		callback(null, head);
	}
}

/** Subidas en curso por envío, para respetar el máximo aunque lleguen en paralelo. */
const inFlight = new Map<string, number>();

export interface ReceiveFileInput {
	submission: SubmissionRecord;
	clientFileId: string;
	originalName: string;
	declaredMime: string;
	contentLength: number;
	body: ReadableStream<Uint8Array>;
}

export async function receiveFile(input: ReceiveFileInput): Promise<UploadFileResponse> {
	const { submission, clientFileId, originalName, declaredMime, contentLength, body } = input;

	// 1. ¿Es un reintento de algo que ya guardamos? → no duplicar.
	const existing = findFileByClientId(submission.id, clientFileId);
	if (existing) {
		discardBody(body, DISCARD_LIMIT);
		return {
			fileId: existing.id,
			storedName: existing.storedName,
			kind: existing.kind,
			size: existing.sizeBytes,
			duplicate: true
		};
	}

	// 2. Validación de nombre, extensión, MIME declarado y tamaño declarado.
	const check = checkFile(originalName, declaredMime, contentLength);
	if (!check.ok) throw new PublicError(check.message.includes('pesa') ? 413 : 415, check.message);
	const type = check.type;

	// 3. Límite de archivos por envío (contando los que se suben en paralelo).
	const active = inFlight.get(submission.id) ?? 0;
	if (countSubmissionFiles(submission.id) + active >= UPLOAD_LIMITS.maxFilesPerSubmission) {
		throw new PublicError(
			409,
			`Solo se pueden compartir ${UPLOAD_LIMITS.maxFilesPerSubmission} archivos por envío. ¡Puedes hacer otro envío después!`
		);
	}

	inFlight.set(submission.id, active + 1);
	let source: Readable | null = null;
	try {
		const guard = new GuardStream(type, maxBytesFor(type.kind), contentLength, originalName);
		// El error puede emitirse antes de que el almacenamiento conecte su pipeline
		// (p. ej. mientras crea carpetas). Sin este listener, Node cerraría el proceso;
		// el pipeline igualmente recibe el error porque el stream queda marcado como fallido.
		guard.on('error', () => undefined);
		source = Readable.fromWeb(body as import('node:stream/web').ReadableStream<Uint8Array>);
		source.on('error', (err) => guard.destroy(err));
		source.pipe(guard);

		const mimeType = type.mimeTypes[0] ?? 'application/octet-stream';
		const directory = `${tableFolder(submission.tableNumber)}/${submission.guestSlug}`;
		const stored = await getStorage().putUnique({
			directory,
			fileName: sanitizeFileName(originalName, type.extension),
			contentType: mimeType,
			source: guard
		});

		const fileId = randomUUID();
		const inserted = insertFile({
			id: fileId,
			submissionId: submission.id,
			clientFileId,
			originalName: originalName.slice(0, 255),
			storedName: stored.fileName,
			mimeType,
			kind: type.kind,
			sizeBytes: stored.size,
			storageKey: stored.key,
			uploadedAt: new Date().toISOString()
		});

		if (!inserted) {
			// Dos peticiones idénticas llegaron a la vez: conservamos la primera.
			await getStorage().remove(stored.key);
			const first = findFileByClientId(submission.id, clientFileId);
			if (!first) throw new Error('Registro duplicado no encontrado');
			return { fileId: first.id, storedName: first.storedName, kind: first.kind, size: first.sizeBytes, duplicate: true };
		}

		return { fileId, storedName: stored.fileName, kind: type.kind, size: stored.size, duplicate: false };
	} catch (err) {
		discardBody(source, DISCARD_LIMIT);
		if (err instanceof PublicError) throw err;
		if (isConnectionError(err)) {
			throw new PublicError(400, `La subida de «${originalName}» se interrumpió. Revisa tu conexión e inténtalo otra vez.`);
		}
		if (isDiskError(err)) {
			console.error('[uploads] Error de almacenamiento', err);
			throw new PublicError(507, 'No hay espacio para guardar más archivos en este momento. Avísale a los anfitriones.');
		}
		throw err;
	} finally {
		const n = (inFlight.get(submission.id) ?? 1) - 1;
		if (n <= 0) inFlight.delete(submission.id);
		else inFlight.set(submission.id, n);
	}
}

function errCode(err: unknown): string | undefined {
	return typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : undefined;
}

function isConnectionError(err: unknown): boolean {
	const code = errCode(err);
	return (
		code === 'ECONNRESET' ||
		code === 'ERR_STREAM_PREMATURE_CLOSE' ||
		code === 'ABORT_ERR' ||
		(err instanceof Error && /aborted|terminated|premature/i.test(err.message))
	);
}

function isDiskError(err: unknown): boolean {
	const code = errCode(err);
	return code === 'ENOSPC' || code === 'EDQUOT';
}
