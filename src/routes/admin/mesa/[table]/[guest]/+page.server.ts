import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listFiles } from '$lib/server/db';

export const load: PageServerLoad = ({ params }) => {
	if (!/^\d{1,4}$/.test(params.table) || !/^[a-z0-9._-]{1,80}$/i.test(params.guest)) {
		error(404, 'Invitado no encontrado');
	}
	const tableNumber = Number(params.table);
	const guestSlug = params.guest.toLowerCase();
	const files = listFiles({ tableNumber, guestSlug });
	if (files.length === 0) error(404, 'Invitado no encontrado');

	return {
		tableNumber,
		guestSlug,
		guestName: files[0]?.guestName ?? guestSlug,
		files
	};
};
