import { error, type RequestHandler } from '@sveltejs/kit';
import { listFiles } from '$lib/server/db';
import { zipResponse } from '$lib/server/zip';

/**
 * Descarga .zip:
 *   /api/admin/download                              → todo el evento
 *   /api/admin/download?mesa=5                       → una mesa
 *   /api/admin/download?mesa=5&invitado=juan-perez   → un invitado
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.admin) error(401, 'Sesión inválida');

	const mesaParam = url.searchParams.get('mesa');
	const guestParam = url.searchParams.get('invitado');

	let tableNumber: number | undefined;
	if (mesaParam !== null) {
		if (!/^\d{1,4}$/.test(mesaParam)) error(400, 'Mesa inválida');
		tableNumber = Number(mesaParam);
	}
	let guestSlug: string | undefined;
	if (guestParam !== null) {
		if (tableNumber === undefined || !/^[a-z0-9._-]{1,80}$/i.test(guestParam)) error(400, 'Invitado inválido');
		guestSlug = guestParam.toLowerCase();
	}

	const files = listFiles({ tableNumber, guestSlug });
	if (files.length === 0) error(404, 'No hay archivos para descargar');

	const parts = ['baby-shower-azul-alejandra'];
	if (tableNumber !== undefined) parts.push(`mesa-${tableNumber}`);
	if (guestSlug) parts.push(guestSlug);
	return zipResponse(files, `${parts.join('_')}.zip`);
};
