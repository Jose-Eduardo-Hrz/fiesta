import { error, type RequestHandler } from '@sveltejs/kit';
import { Readable } from 'node:stream';
import { getAdminFile } from '$lib/server/db';
import { getStorage } from '$lib/server/storage';
import { isUuid } from '$lib/server/http';

/**
 * Sirve un archivo al panel. Soporta peticiones Range (206), necesarias para
 * que los videos se puedan adelantar y para que Safari/iOS los reproduzca.
 * La autenticación la aplica hooks.server.ts para todo /api/admin; aquí se
 * comprueba otra vez como defensa en profundidad.
 */
export const GET: RequestHandler = async ({ params, url, request, locals }) => {
	if (!locals.admin) error(401, 'Sesión inválida');
	if (!isUuid(params.id)) error(404, 'Archivo no encontrado');

	const file = getAdminFile(params.id);
	if (!file) error(404, 'Archivo no encontrado');

	const storage = getStorage();
	const info = await storage.stat(file.storageKey);
	if (!info) error(404, 'El archivo ya no está en el almacenamiento');

	const download = url.searchParams.get('download') === '1';
	const encodedName = encodeURIComponent(file.storedName);
	const headers = new Headers({
		'Content-Type': file.mimeType,
		'Accept-Ranges': 'bytes',
		'Cache-Control': 'private, max-age=3600',
		'X-Content-Type-Options': 'nosniff',
		'Content-Security-Policy': "default-src 'none'; img-src 'self'; media-src 'self'; sandbox",
		'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${file.storedName}"; filename*=UTF-8''${encodedName}`
	});

	const range = parseRange(request.headers.get('range'), info.size);
	if (range === 'invalid') {
		headers.set('Content-Range', `bytes */${info.size}`);
		return new Response(null, { status: 416, headers });
	}

	const stream = await storage.read(file.storageKey, range ?? undefined);
	const body = Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;

	if (range) {
		headers.set('Content-Range', `bytes ${range.start}-${range.end}/${info.size}`);
		headers.set('Content-Length', String(range.end - range.start + 1));
		return new Response(body, { status: 206, headers });
	}
	headers.set('Content-Length', String(info.size));
	return new Response(body, { status: 200, headers });
};

function parseRange(header: string | null, size: number): { start: number; end: number } | null | 'invalid' {
	if (!header) return null;
	const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
	if (!match) return null; // rangos múltiples u otros formatos: se envía completo
	const [, startText = '', endText = ''] = match;
	let start: number;
	let end: number;
	if (startText === '') {
		if (endText === '') return 'invalid';
		start = Math.max(size - Number(endText), 0);
		end = size - 1;
	} else {
		start = Number(startText);
		end = endText === '' ? size - 1 : Math.min(Number(endText), size - 1);
	}
	if (start > end || start >= size) return 'invalid';
	return { start, end };
}
