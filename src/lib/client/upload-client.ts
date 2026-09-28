/**
 * Cliente de subida del navegador.
 *
 * Se usa XMLHttpRequest (y no fetch) porque es la única API que informa el
 * progreso de SUBIDA en todos los navegadores móviles. El archivo se envía
 * directamente como cuerpo: el navegador lo lee del disco en streaming,
 * sin cargarlo completo en memoria.
 */
import type {
	ApiErrorBody,
	CompleteSubmissionResponse,
	CreateSubmissionResponse,
	UploadFileResponse
} from '$lib/types';

export class UploadError extends Error {
	constructor(
		message: string,
		/** `true` si vale la pena reintentar (conexión, servidor ocupado…). */
		readonly retryable: boolean
	) {
		super(message);
		this.name = 'UploadError';
	}
}

const OFFLINE_MESSAGE = 'Parece que se perdió la conexión a internet. Revisa tu Wi-Fi o datos y vuelve a intentarlo.';

function messageFromBody(text: string, fallback: string): string {
	try {
		const body = JSON.parse(text) as Partial<ApiErrorBody>;
		if (typeof body.message === 'string' && body.message) return body.message;
	} catch {
		/* respuesta no JSON (p. ej. un proxy) */
	}
	return fallback;
}

function isRetryableStatus(status: number): boolean {
	return status === 0 || status === 408 || status === 429 || status >= 500;
}

async function postJson<T>(url: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify(body)
		});
	} catch {
		throw new UploadError(OFFLINE_MESSAGE, true);
	}
	const text = await response.text();
	if (!response.ok) {
		throw new UploadError(
			messageFromBody(text, 'Ocurrió un problema con el servidor. Intenta de nuevo en un momento.'),
			isRetryableStatus(response.status)
		);
	}
	return JSON.parse(text) as T;
}

export function createSubmission(name: string, table: number): Promise<CreateSubmissionResponse> {
	return postJson<CreateSubmissionResponse>('/api/submissions', { name, table });
}

export function completeSubmission(submissionId: string, uploadToken: string): Promise<CompleteSubmissionResponse> {
	return postJson<CompleteSubmissionResponse>(
		`/api/submissions/${submissionId}/complete`,
		{},
		{ 'X-Upload-Token': uploadToken }
	);
}

export interface UploadFileOptions {
	submissionId: string;
	uploadToken: string;
	clientFileId: string;
	file: File;
	onProgress: (loaded: number, total: number) => void;
	signal?: AbortSignal;
}

export function uploadFile(opts: UploadFileOptions): Promise<UploadFileResponse> {
	const { submissionId, uploadToken, clientFileId, file, onProgress, signal } = opts;

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', `/api/submissions/${submissionId}/files`);
		xhr.setRequestHeader('X-Upload-Token', uploadToken);
		xhr.setRequestHeader('X-Client-File-Id', clientFileId);
		xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
		xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress(e.loaded, e.total);
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					resolve(JSON.parse(xhr.responseText) as UploadFileResponse);
				} catch {
					reject(new UploadError('Respuesta inesperada del servidor.', true));
				}
				return;
			}
			const fallback =
				xhr.status === 413
					? `«${file.name}» es demasiado grande.`
					: `No pudimos subir «${file.name}». Intenta de nuevo.`;
			reject(new UploadError(messageFromBody(xhr.responseText, fallback), isRetryableStatus(xhr.status)));
		};

		xhr.onerror = () => reject(new UploadError(OFFLINE_MESSAGE, true));
		xhr.ontimeout = () => reject(new UploadError(OFFLINE_MESSAGE, true));
		xhr.onabort = () => reject(new UploadError('Subida cancelada.', true));

		if (signal) {
			if (signal.aborted) {
				reject(new UploadError('Subida cancelada.', true));
				return;
			}
			signal.addEventListener('abort', () => xhr.abort(), { once: true });
		}

		xhr.send(file);
	});
}
