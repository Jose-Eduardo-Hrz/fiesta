/**
 * Estado y lógica de la subida de un invitado (runes de Svelte 5).
 *
 * - Valida cada archivo al seleccionarlo (tipo, tamaño, duplicados, máximo).
 * - Sube en paralelo (UPLOAD_LIMITS.parallelUploads) con progreso por archivo.
 * - Reintenta automáticamente los errores de red una vez.
 * - Si algo falla, conserva lo que ya subió y permite reintentar solo lo pendiente.
 */
import { UPLOAD_LIMITS, type MediaKind } from '$lib/config';
import { checkFile } from '$lib/validation';
import type { GuestInput } from '$lib/validation';
import type { CompleteSubmissionResponse } from '$lib/types';
import { UploadError, completeSubmission, createSubmission, uploadFile } from './upload-client';

export type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface SelectedFile {
	id: string;
	file: File;
	kind: MediaKind;
	previewUrl: string | null;
	status: FileStatus;
	loaded: number;
	error: string | null;
}

export type QueuePhase = 'selecting' | 'uploading' | 'failed' | 'finished';

function fingerprint(file: File): string {
	return `${file.name}|${file.size}|${file.lastModified}`;
}

function newId(): string {
	if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
	// Navegadores antiguos o contextos sin HTTPS
	const b = crypto.getRandomValues(new Uint8Array(16));
	b[6] = ((b[6] ?? 0) & 0x0f) | 0x40;
	b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
	const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class UploadQueue {
	items = $state<SelectedFile[]>([]);
	phase = $state<QueuePhase>('selecting');
	/** Mensajes de archivos rechazados en la última selección. */
	rejections = $state<string[]>([]);
	/** Error general del envío (conexión, servidor…). */
	error = $state<string | null>(null);

	totalBytes = $derived(this.items.reduce((sum, i) => sum + i.file.size, 0));
	uploadedBytes = $derived(this.items.reduce((sum, i) => sum + (i.status === 'done' ? i.file.size : i.loaded), 0));
	progress = $derived(this.totalBytes > 0 ? this.uploadedBytes / this.totalBytes : 0);
	images = $derived(this.items.filter((i) => i.kind === 'image').length);
	videos = $derived(this.items.filter((i) => i.kind === 'video').length);
	doneCount = $derived(this.items.filter((i) => i.status === 'done').length);
	failedCount = $derived(this.items.filter((i) => i.status === 'error').length);
	remainingSlots = $derived(UPLOAD_LIMITS.maxFilesPerSubmission - this.items.length);
	isBusy = $derived(this.phase === 'uploading');

	private submission: { id: string; token: string } | null = null;
	private controller: AbortController | null = null;

	add(files: Iterable<File>): void {
		if (this.isBusy) return;
		const rejections: string[] = [];
		const known = new Set(this.items.map((i) => fingerprint(i.file)));
		let skippedForLimit = 0;

		for (const file of files) {
			const check = checkFile(file.name, file.type, file.size);
			if (!check.ok) {
				rejections.push(check.message);
				continue;
			}
			const fp = fingerprint(file);
			if (known.has(fp)) {
				rejections.push(`«${file.name}» ya estaba en tu lista.`);
				continue;
			}
			if (this.items.length >= UPLOAD_LIMITS.maxFilesPerSubmission) {
				skippedForLimit++;
				continue;
			}
			known.add(fp);
			this.items.push({
				id: newId(),
				file,
				kind: check.type.kind,
				previewUrl: URL.createObjectURL(file),
				status: 'pending',
				loaded: 0,
				error: null
			});
		}

		if (skippedForLimit > 0) {
			rejections.push(
				`Puedes compartir hasta ${UPLOAD_LIMITS.maxFilesPerSubmission} archivos por envío; ${skippedForLimit} no se agregaron. ¡Puedes enviarlos en otro envío!`
			);
		}
		this.rejections = rejections;
		if (this.phase === 'failed' || this.phase === 'finished') this.phase = 'selecting';
		this.error = null;
	}

	remove(id: string): void {
		if (this.isBusy) return;
		const index = this.items.findIndex((i) => i.id === id);
		if (index === -1) return;
		const [removed] = this.items.splice(index, 1);
		if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
	}

	clearRejections(): void {
		this.rejections = [];
	}

	/** Sube todo lo pendiente. Devuelve el resumen si todo terminó bien. */
	async start(guest: GuestInput): Promise<CompleteSubmissionResponse | null> {
		if (this.isBusy) return null; // evita envíos duplicados
		if (this.items.length === 0) {
			this.error = 'Elige al menos una foto o video para compartir.';
			return null;
		}

		this.phase = 'uploading';
		this.error = null;
		this.rejections = [];
		this.controller = new AbortController();

		try {
			if (!this.submission) {
				const created = await createSubmission(guest.name, guest.table);
				this.submission = { id: created.submissionId, token: created.uploadToken };
			}
			const submission = this.submission;

			for (const item of this.items) {
				if (item.status === 'error') {
					item.status = 'pending';
					item.error = null;
					item.loaded = 0;
				}
			}

			const pending = this.items.filter((i) => i.status === 'pending');
			let cursor = 0;
			const worker = async () => {
				while (cursor < pending.length) {
					const item = pending[cursor++];
					if (item) await this.uploadOne(item, submission);
				}
			};
			const workers = Math.min(UPLOAD_LIMITS.parallelUploads, pending.length);
			await Promise.all(Array.from({ length: workers }, worker));

			if (this.failedCount > 0) {
				this.phase = 'failed';
				this.error =
					this.doneCount > 0
						? `Se subieron ${this.doneCount} de ${this.items.length} archivos. Presiona «Reintentar» para enviar los que faltan.`
						: 'No pudimos subir tus archivos. Revisa tu conexión y presiona «Reintentar».';
				return null;
			}

			const summary = await completeSubmission(submission.id, submission.token);
			this.phase = 'finished';
			return summary;
		} catch (err) {
			this.phase = 'failed';
			this.error = err instanceof UploadError ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.';
			if (err instanceof UploadError && !err.retryable && /sesión/i.test(err.message)) {
				this.submission = null; // token expirado: se creará uno nuevo al reintentar
			}
			return null;
		} finally {
			this.controller = null;
		}
	}

	private async uploadOne(item: SelectedFile, submission: { id: string; token: string }): Promise<void> {
		item.status = 'uploading';
		for (let attempt = 1; attempt <= 2; attempt++) {
			try {
				await uploadFile({
					submissionId: submission.id,
					uploadToken: submission.token,
					clientFileId: item.id,
					file: item.file,
					signal: this.controller?.signal,
					onProgress: (loaded) => {
						item.loaded = loaded;
					}
				});
				item.status = 'done';
				item.loaded = item.file.size;
				return;
			} catch (err) {
				const retryable = err instanceof UploadError && err.retryable;
				if (retryable && attempt < 2 && !this.controller?.signal.aborted) {
					item.loaded = 0;
					await wait(1500);
					continue;
				}
				item.status = 'error';
				item.loaded = 0;
				item.error = err instanceof UploadError ? err.message : 'No se pudo subir este archivo.';
				return;
			}
		}
	}

	cancel(): void {
		this.controller?.abort();
	}

	destroy(): void {
		this.cancel();
		for (const item of this.items) {
			if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
		}
	}
}
