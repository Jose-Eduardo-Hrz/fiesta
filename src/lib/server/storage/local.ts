import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import type { Readable } from 'node:stream';
import { numberedFileName } from '../sanitize';
import type { ByteRange, PutInput, PutResult, StorageDriver } from './types';

const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const MAX_NAME_ATTEMPTS = 1000;

/**
 * Almacenamiento en el disco del servidor.
 *
 * Flujo de escritura:
 *  1. El contenido se escribe en streaming a `.tmp/<uuid>.part` (nunca en memoria).
 *  2. Si el stream falla, se borra el temporal: no quedan archivos a medias.
 *  3. Se reserva el nombre final con `open(..., 'wx')`, que falla de forma
 *     atómica si ya existe → así dos subidas simultáneas nunca se pisan.
 *  4. Se mueve el temporal sobre el nombre reservado (misma unidad = instantáneo).
 */
export class LocalStorage implements StorageDriver {
	private readonly tmpDir: string;

	constructor(private readonly root: string) {
		this.tmpDir = path.join(root, '.tmp');
	}

	/** Convierte una key en ruta absoluta, bloqueando cualquier path traversal. */
	private resolve(key: string): string {
		const segments = key.split('/');
		if (segments.length === 0 || !segments.every((s) => SAFE_SEGMENT.test(s) && s !== '..')) {
			throw new Error(`Ruta de almacenamiento inválida: ${key}`);
		}
		const full = path.resolve(this.root, ...segments);
		if (!full.startsWith(this.root + path.sep)) {
			throw new Error(`Ruta fuera del almacenamiento: ${key}`);
		}
		return full;
	}

	async putUnique({ directory, fileName, source }: PutInput): Promise<PutResult> {
		await fs.mkdir(this.tmpDir, { recursive: true });
		const tmpPath = path.join(this.tmpDir, `${randomUUID()}.part`);

		try {
			await pipeline(source, createWriteStream(tmpPath, { flags: 'wx' }));
			const { size } = await fs.stat(tmpPath);

			const dirPath = this.resolve(directory);
			await fs.mkdir(dirPath, { recursive: true });

			for (let n = 1; n <= MAX_NAME_ATTEMPTS; n++) {
				const candidate = numberedFileName(fileName, n);
				const key = `${directory}/${candidate}`;
				const finalPath = this.resolve(key);
				try {
					const handle = await fs.open(finalPath, 'wx');
					await handle.close();
				} catch (err) {
					if (isErrno(err, 'EEXIST')) continue;
					throw err;
				}
				await renameWithRetry(tmpPath, finalPath);
				return { key, fileName: candidate, size };
			}
			throw new Error('No se encontró un nombre libre para el archivo');
		} catch (err) {
			await fs.rm(tmpPath, { force: true }).catch(() => undefined);
			throw err;
		}
	}

	async read(key: string, range?: ByteRange): Promise<Readable> {
		const full = this.resolve(key);
		return createReadStream(full, range ? { start: range.start, end: range.end } : undefined);
	}

	async stat(key: string): Promise<{ size: number } | null> {
		try {
			const s = await fs.stat(this.resolve(key));
			return s.isFile() ? { size: s.size } : null;
		} catch (err) {
			if (isErrno(err, 'ENOENT')) return null;
			throw err;
		}
	}

	async remove(key: string): Promise<void> {
		await fs.rm(this.resolve(key), { force: true });
	}

	/** Borra temporales huérfanos (p. ej. si el servidor se reinició a mitad de una subida). */
	async cleanupTemp(olderThanMs = 6 * 60 * 60 * 1000): Promise<void> {
		try {
			const entries = await fs.readdir(this.tmpDir);
			const now = Date.now();
			await Promise.all(
				entries.map(async (name) => {
					const p = path.join(this.tmpDir, name);
					const s = await fs.stat(p);
					if (now - s.mtimeMs > olderThanMs) await fs.rm(p, { force: true });
				})
			);
		} catch {
			/* la carpeta puede no existir todavía */
		}
	}
}

function isErrno(err: unknown, code: string): boolean {
	return typeof err === 'object' && err !== null && 'code' in err && (err as NodeJS.ErrnoException).code === code;
}

/** En Windows un antivirus puede bloquear el archivo unos milisegundos. */
async function renameWithRetry(from: string, to: string, attempts = 5): Promise<void> {
	for (let i = 1; ; i++) {
		try {
			await fs.rename(from, to);
			return;
		} catch (err) {
			if (i >= attempts || !(isErrno(err, 'EPERM') || isErrno(err, 'EBUSY') || isErrno(err, 'EACCES'))) {
				await fs.rm(to, { force: true }).catch(() => undefined);
				throw err;
			}
			await new Promise((r) => setTimeout(r, 50 * i));
		}
	}
}
