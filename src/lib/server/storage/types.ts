import type { Readable } from 'node:stream';

/**
 * Contrato de almacenamiento. La aplicación solo habla con esta interfaz,
 * así que cambiar de disco local a S3 / R2 / MinIO / Backblaze consiste en
 * escribir otra implementación y seleccionarla en `storage/index.ts`.
 *
 * Las "keys" son rutas relativas con "/" como separador, por ejemplo:
 *   mesa-5/Juan-Perez/IMG_001.jpg
 */
export interface StorageDriver {
	/**
	 * Guarda el contenido en `directory` con un nombre derivado de `fileName`.
	 * Nunca sobrescribe: si el nombre existe usa "nombre-2.ext", "nombre-3.ext"…
	 * Si `source` falla (error de validación, conexión perdida) no debe quedar
	 * ningún archivo parcial.
	 */
	putUnique(input: PutInput): Promise<PutResult>;

	/** Abre un archivo para leerlo, opcionalmente solo un rango de bytes. */
	read(key: string, range?: ByteRange): Promise<Readable>;

	/** Tamaño del archivo o `null` si no existe. */
	stat(key: string): Promise<{ size: number } | null>;

	/** Elimina un archivo (se ignora si no existe). */
	remove(key: string): Promise<void>;
}

export interface PutInput {
	directory: string;
	fileName: string;
	contentType: string;
	source: Readable;
}

export interface PutResult {
	key: string;
	fileName: string;
	size: number;
}

export interface ByteRange {
	start: number;
	/** Inclusivo. */
	end: number;
}
