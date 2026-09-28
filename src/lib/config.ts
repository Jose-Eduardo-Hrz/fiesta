/**
 * Configuración central de la aplicación.
 *
 * Este archivo lo usan TANTO el navegador como el servidor, así que aquí
 * NO debe ir ningún secreto (los secretos van en variables de entorno).
 * Las validaciones del navegador son solo para dar mensajes rápidos;
 * el servidor vuelve a validar todo con estos mismos valores.
 */

export const EVENT = {
	babyName: 'Azul Alejandra',
	dad: 'José Eduardo Hernández',
	dadShort: 'José Eduardo',
	mom: 'Erandi Yolanda Loeza',
	momShort: 'Erandi',
	dog: 'Pascual',
	title: 'Baby Shower de Azul Alejandra',
	tagline: 'Cada foto y cada video que compartas se convertirá en un recuerdo que Azul atesorará para siempre.',
	/**
	 * Foto opcional del evento (ecografía, sesión de embarazo, etc.).
	 * Coloca el archivo en `static/evento/` y escribe aquí su ruta pública,
	 * por ejemplo: '/evento/portada.jpg'. Con `null` se muestra una
	 * ilustración de ositos en su lugar.
	 */
	heroPhoto: null as string | null,
	heroPhotoAlt: 'José Eduardo y Erandi esperando a Azul Alejandra'
} as const;

export type MediaKind = 'image' | 'video';

export interface AllowedFileType {
	/** Extensión en minúsculas, sin punto. */
	extension: string;
	/** Tipos MIME aceptados para esta extensión (el primero es el canónico). */
	mimeTypes: readonly string[];
	kind: MediaKind;
}

/** Tipos de archivo permitidos. Agrega o quita entradas aquí. */
export const ALLOWED_FILE_TYPES: readonly AllowedFileType[] = [
	{ extension: 'jpg', mimeTypes: ['image/jpeg', 'image/pjpeg'], kind: 'image' },
	{ extension: 'jpeg', mimeTypes: ['image/jpeg', 'image/pjpeg'], kind: 'image' },
	{ extension: 'png', mimeTypes: ['image/png'], kind: 'image' },
	{ extension: 'gif', mimeTypes: ['image/gif'], kind: 'image' },
	{ extension: 'webp', mimeTypes: ['image/webp'], kind: 'image' },
	// Formato por defecto de las fotos de iPhone
	{ extension: 'heic', mimeTypes: ['image/heic', 'image/heif', 'image/heic-sequence'], kind: 'image' },
	{ extension: 'heif', mimeTypes: ['image/heif', 'image/heic', 'image/heif-sequence'], kind: 'image' },
	{ extension: 'mp4', mimeTypes: ['video/mp4'], kind: 'video' },
	{ extension: 'm4v', mimeTypes: ['video/x-m4v', 'video/mp4'], kind: 'video' },
	// Formato por defecto de los videos de iPhone
	{ extension: 'mov', mimeTypes: ['video/quicktime', 'video/mp4'], kind: 'video' },
	{ extension: 'webm', mimeTypes: ['video/webm'], kind: 'video' },
	{ extension: '3gp', mimeTypes: ['video/3gpp', 'video/mp4'], kind: 'video' }
];

const MB = 1024 * 1024;

export const UPLOAD_LIMITS = {
	/** Tamaño máximo por fotografía. */
	maxImageBytes: 30 * MB,
	/** Tamaño máximo por video. */
	maxVideoBytes: 1024 * MB,
	/** Número máximo de archivos en un solo envío. */
	maxFilesPerSubmission: 60,
	/** Número de mesa más alto que existe en el salón. */
	maxTableNumber: 60,
	/** Longitud del nombre del invitado. */
	minNameLength: 2,
	maxNameLength: 60,
	/** Archivos que se suben en paralelo desde el celular. */
	parallelUploads: 2
} as const;

export function maxBytesFor(kind: MediaKind): number {
	return kind === 'image' ? UPLOAD_LIMITS.maxImageBytes : UPLOAD_LIMITS.maxVideoBytes;
}

/** Atributo `accept` del <input type="file">. */
export const FILE_INPUT_ACCEPT = [
	'image/*',
	'video/*',
	...ALLOWED_FILE_TYPES.map((t) => `.${t.extension}`)
].join(',');
