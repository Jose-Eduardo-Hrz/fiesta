import { json } from '@sveltejs/kit';
import { Readable } from 'node:stream';
import type { ApiErrorBody } from '$lib/types';

/**
 * Error "esperado" con un mensaje apto para mostrar al invitado.
 * Cualquier otro error se registra en el servidor y se responde con un
 * mensaje genérico, sin detalles internos (rutas, SQL, stack traces).
 */
export class PublicError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'PublicError';
	}
}

export function apiError(status: number, message: string): Response {
	const body: ApiErrorBody = { message };
	return json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function handleApiError(err: unknown, context: string): Response {
	if (err instanceof PublicError) return apiError(err.status, err.message);
	console.error(`[${context}]`, err);
	return apiError(500, 'Tuvimos un problema al guardar tu archivo. Intenta de nuevo en un momento.');
}

/**
 * Descarta el resto del cuerpo de una petición SIN cortar la conexión.
 *
 * Si respondemos con un error (archivo inválido, duplicado…) mientras el
 * celular todavía está enviando, cancelar el stream destruiría el socket y el
 * navegador solo vería "error de red". Leyendo y tirando los bytes, la
 * conexión sigue viva y el invitado recibe el mensaje real. Para no gastar
 * ancho de banda indefinidamente, pasado `maxBytes` sí se corta.
 */
export function discardBody(body: Readable | ReadableStream<Uint8Array> | null, maxBytes: number): void {
	if (!body) return;
	let source: Readable;
	if (body instanceof Readable) {
		source = body;
	} else {
		if (body.locked) return;
		source = Readable.fromWeb(body as import('node:stream/web').ReadableStream<Uint8Array>);
	}
	if (source.destroyed) return;
	let discarded = 0;
	source.unpipe();
	source.on('error', () => undefined);
	source.on('data', (chunk: Buffer) => {
		discarded += chunk.length;
		if (discarded > maxBytes) source.destroy();
	});
	source.resume();
}

const UUID =/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): value is string {
	return typeof value === 'string' && UUID.test(value);
}
