/**
 * Verificación de la firma binaria ("magic bytes") de cada archivo.
 *
 * El tipo MIME y la extensión los decide el navegador y pueden falsificarse;
 * los primeros bytes del contenido dicen qué es realmente el archivo.
 */

/** Bytes mínimos que necesitamos para identificar el formato. */
export const SIGNATURE_BYTES = 32;

type Detected = 'jpeg' | 'png' | 'gif' | 'webp' | 'heif' | 'isobmff-video' | 'quicktime-legacy' | 'ebml' | 'unknown';

const HEIF_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1', 'avif', 'avis']);
// Átomos con los que puede empezar un .mov antiguo sin caja "ftyp"
const QUICKTIME_ATOMS = new Set(['moov', 'mdat', 'wide', 'free', 'skip', 'pnot']);

function ascii(buf: Uint8Array, start: number, end: number): string {
	return String.fromCharCode(...buf.subarray(start, end));
}

function startsWith(buf: Uint8Array, bytes: readonly number[], offset = 0): boolean {
	return bytes.every((b, i) => buf[offset + i] === b);
}

export function detectFormat(head: Uint8Array): Detected {
	if (head.length < 12) return 'unknown';

	if (startsWith(head, [0xff, 0xd8, 0xff])) return 'jpeg';
	if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
	if (ascii(head, 0, 6) === 'GIF87a' || ascii(head, 0, 6) === 'GIF89a') return 'gif';
	if (ascii(head, 0, 4) === 'RIFF' && ascii(head, 8, 12) === 'WEBP') return 'webp';
	if (startsWith(head, [0x1a, 0x45, 0xdf, 0xa3])) return 'ebml';

	const box = ascii(head, 4, 8);
	if (box === 'ftyp') {
		const major = ascii(head, 8, 12);
		if (HEIF_BRANDS.has(major)) return 'heif';
		return 'isobmff-video';
	}
	if (QUICKTIME_ATOMS.has(box)) return 'quicktime-legacy';

	return 'unknown';
}

const EXPECTED: Record<string, readonly Detected[]> = {
	jpg: ['jpeg'],
	jpeg: ['jpeg'],
	png: ['png'],
	gif: ['gif'],
	webp: ['webp'],
	heic: ['heif'],
	heif: ['heif'],
	mp4: ['isobmff-video'],
	m4v: ['isobmff-video'],
	mov: ['isobmff-video', 'quicktime-legacy'],
	'3gp': ['isobmff-video'],
	webm: ['ebml']
};

/** ¿El contenido real coincide con la extensión declarada? */
export function signatureMatches(extension: string, head: Uint8Array): boolean {
	const expected = EXPECTED[extension];
	if (!expected) return false;
	return expected.includes(detectFormat(head));
}
