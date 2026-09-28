/**
 * Descargas .zip generadas en streaming.
 *
 * El zip se va construyendo mientras se envía al navegador: no se crea un
 * archivo temporal ni se carga nada completo en memoria, así que funciona
 * igual con 10 MB que con 20 GB. Se usa compresión STORE (sin comprimir)
 * porque fotos y videos ya vienen comprimidos: es mucho más rápido.
 */
import { Readable } from 'node:stream';
import { ZipArchive } from 'archiver';
import type { AdminFile } from '$lib/types';
import { getStorage } from './storage';

export function zipResponse(files: AdminFile[], downloadName: string): Response {
	const archive = new ZipArchive({ store: true });
	const storage = getStorage();

	archive.on('warning', (err) => console.warn('[zip]', err));
	archive.on('error', (err) => console.error('[zip]', err));

	// Los archivos se agregan de uno en uno para no abrir cientos a la vez.
	void (async () => {
		try {
			for (const file of files) {
				if (archive.destroyed) return;
				const exists = await storage.stat(file.storageKey);
				if (!exists) {
					console.warn(`[zip] Falta en el almacenamiento: ${file.storageKey}`);
					continue;
				}
				const stream = await storage.read(file.storageKey);
				await new Promise<void>((resolve, reject) => {
					const onClose = () => reject(new Error('Descarga cancelada'));
					archive.once('close', onClose);
					archive.once('entry', () => {
						archive.off('close', onClose);
						resolve();
					});
					stream.once('error', reject);
					archive.append(stream, { name: file.storageKey, date: new Date(file.uploadedAt) });
				});
			}
			await archive.finalize();
		} catch (err) {
			console.error('[zip] Error generando el archivo', err);
			archive.destroy(err instanceof Error ? err : new Error(String(err)));
		}
	})();

	const body = Readable.toWeb(archive) as unknown as ReadableStream<Uint8Array>;
	const safeName = downloadName.replace(/[^A-Za-z0-9._-]/g, '-');

	return new Response(body, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${safeName}"`,
			'Cache-Control': 'no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
