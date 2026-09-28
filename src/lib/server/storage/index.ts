import { getStorageDir } from '../env';
import { LocalStorage } from './local';
import type { StorageDriver } from './types';

export type { StorageDriver } from './types';

/**
 * Punto único de selección del almacenamiento.
 *
 * Para usar S3 (o R2, MinIO, Backblaze B2, DigitalOcean Spaces):
 *   1. pnpm add @aws-sdk/client-s3 @aws-sdk/lib-storage
 *   2. Crear `s3.ts` que implemente StorageDriver:
 *      - putUnique: HeadObject para elegir un nombre libre y `Upload`
 *        (lib-storage) para subir el stream en partes, sin cargarlo en memoria.
 *      - read: GetObject con cabecera Range.
 *      - stat: HeadObject.  remove: DeleteObject.
 *   3. Devolver aquí `new S3Storage(...)` según una variable STORAGE_DRIVER.
 * El resto de la aplicación no cambia.
 */
const globalForStorage = globalThis as unknown as { __babyShowerStorage?: LocalStorage };

export function getStorage(): StorageDriver {
	if (!globalForStorage.__babyShowerStorage) {
		const local = new LocalStorage(getStorageDir());
		void local.cleanupTemp();
		globalForStorage.__babyShowerStorage = local;
	}
	return globalForStorage.__babyShowerStorage;
}
