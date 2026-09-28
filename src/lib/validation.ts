/**
 * Validaciones compartidas entre navegador y servidor.
 * El servidor SIEMPRE vuelve a ejecutarlas: nunca confiamos solo en el navegador.
 */
import { ALLOWED_FILE_TYPES, UPLOAD_LIMITS, maxBytesFor, type AllowedFileType } from './config';
import { formatBytes } from './utils/format';

export interface GuestInput {
	name: string;
	table: number;
}

export type GuestErrors = Partial<Record<'name' | 'table', string>>;

export type GuestValidation =
	| { ok: true; value: GuestInput }
	| { ok: false; errors: GuestErrors };

/** Elimina espacios repetidos y caracteres de control. */
export function normalizeName(raw: string): string {
	return raw
		.normalize('NFC')
		.replace(/[\p{Cc}\p{Cf}]/gu, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function validateGuest(rawName: unknown, rawTable: unknown): GuestValidation {
	const errors: GuestErrors = {};
	const name = typeof rawName === 'string' ? normalizeName(rawName) : '';

	if (!name) {
		errors.name = 'Escribe tu nombre para saber de quién son los recuerdos.';
	} else if (name.length < UPLOAD_LIMITS.minNameLength) {
		errors.name = 'Tu nombre es muy corto.';
	} else if (name.length > UPLOAD_LIMITS.maxNameLength) {
		errors.name = `Usa como máximo ${UPLOAD_LIMITS.maxNameLength} caracteres.`;
	} else if (!/\p{L}/u.test(name)) {
		errors.name = 'Tu nombre debe incluir letras.';
	}

	const tableText = typeof rawTable === 'number' ? String(rawTable) : typeof rawTable === 'string' ? rawTable.trim() : '';
	const table = Number(tableText);

	if (!tableText) {
		errors.table = 'Indica tu número de mesa.';
	} else if (!/^\d{1,3}$/.test(tableText) || !Number.isInteger(table) || table < 1 || table > UPLOAD_LIMITS.maxTableNumber) {
		errors.table = `El número de mesa debe estar entre 1 y ${UPLOAD_LIMITS.maxTableNumber}.`;
	}

	if (errors.name || errors.table) return { ok: false, errors };
	return { ok: true, value: { name, table } };
}

export function getExtension(fileName: string): string {
	const base = fileName.split(/[\\/]/).pop() ?? '';
	const dot = base.lastIndexOf('.');
	return dot > 0 ? base.slice(dot + 1).toLowerCase() : '';
}

export function findAllowedType(fileName: string): AllowedFileType | undefined {
	const ext = getExtension(fileName);
	return ALLOWED_FILE_TYPES.find((t) => t.extension === ext);
}

/**
 * Algunos celulares (sobre todo Android con HEIC) envían el tipo vacío o
 * genérico. En ese caso decide la extensión + la firma binaria en el servidor.
 */
export function isAcceptableMime(type: AllowedFileType, mime: string): boolean {
	const clean = mime.split(';')[0]?.trim().toLowerCase() ?? '';
	if (clean === '' || clean === 'application/octet-stream') return true;
	return type.mimeTypes.includes(clean);
}

export type FileCheck = { ok: true; type: AllowedFileType } | { ok: false; message: string };

/** Validación de un archivo (nombre, tipo declarado y tamaño). */
export function checkFile(name: string, mime: string, size: number): FileCheck {
	const type = findAllowedType(name);
	if (!type || !isAcceptableMime(type, mime)) {
		return {
			ok: false,
			message: `«${name}» no es una foto o video compatible. Usa JPG, PNG, HEIC, MP4 o MOV.`
		};
	}
	if (size <= 0) {
		return { ok: false, message: `«${name}» está vacío.` };
	}
	const max = maxBytesFor(type.kind);
	if (size > max) {
		return {
			ok: false,
			message: `«${name}» pesa ${formatBytes(size)}; el máximo para ${type.kind === 'image' ? 'fotos' : 'videos'} es ${formatBytes(max)}.`
		};
	}
	return { ok: true, type };
}
