/**
 * Sanitización de nombres de carpetas y archivos.
 *
 * Objetivos: sin acentos ni espacios, sin separadores de ruta, sin `..`,
 * sin nombres reservados de Windows y con una longitud razonable.
 * El resultado solo contiene [A-Za-z0-9._-].
 */

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

function toAsciiSlug(input: string, maxLength: number): string {
	return input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '') // quita acentos: é → e, ñ → n
		.replace(/[^A-Za-z0-9._-]+/g, '-')
		.replace(/[-_.]{2,}/g, (m) => m[0] ?? '-') // evita "..", "--"
		.replace(/^[-_.]+|[-_.]+$/g, '')
		.slice(0, maxLength)
		.replace(/[-_.]+$/g, '');
}

/** "Juan Pérez" → "Juan-Perez" */
export function slugifyGuestName(name: string): string {
	const slug = toAsciiSlug(name.replace(/\./g, ' '), 60);
	if (!slug) return 'invitado';
	return WINDOWS_RESERVED.test(slug) ? `invitado-${slug}` : slug;
}

/** 5 → "mesa-5" */
export function tableFolder(table: number): string {
	if (!Number.isInteger(table) || table < 1) throw new Error('Número de mesa inválido');
	return `mesa-${table}`;
}

/**
 * Sanitiza un nombre de archivo enviado por el navegador.
 * La extensión NO se toma del nombre original sino de la ya validada.
 */
export function sanitizeFileName(originalName: string, extension: string): string {
	// Nos quedamos solo con el último segmento: descarta "../../etc/passwd" o "C:\x\y"
	const base = originalName.split(/[\\/]/).pop() ?? '';
	const dot = base.lastIndexOf('.');
	const stem = dot > 0 ? base.slice(0, dot) : base;

	let safeStem = toAsciiSlug(stem.replace(/\./g, '-'), 80);
	if (!safeStem) safeStem = 'archivo';
	if (WINDOWS_RESERVED.test(safeStem)) safeStem = `archivo-${safeStem}`;

	const safeExt = extension.toLowerCase().replace(/[^a-z0-9]/g, '');
	return `${safeStem}.${safeExt}`;
}

/** "IMG_001.jpg", 2 → "IMG_001-2.jpg" */
export function numberedFileName(fileName: string, n: number): string {
	if (n <= 1) return fileName;
	const dot = fileName.lastIndexOf('.');
	return dot > 0 ? `${fileName.slice(0, dot)}-${n}${fileName.slice(dot)}` : `${fileName}-${n}`;
}

/** Decodifica el nombre enviado en la cabecera X-File-Name. */
export function decodeHeaderFileName(value: string | null): string {
	if (!value) return '';
	try {
		return decodeURIComponent(value).slice(0, 255);
	} catch {
		return '';
	}
}
