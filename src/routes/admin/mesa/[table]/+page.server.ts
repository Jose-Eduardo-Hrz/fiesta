import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listGuests } from '$lib/server/db';

export const load: PageServerLoad = ({ params }) => {
	if (!/^\d{1,4}$/.test(params.table)) error(404, 'Mesa no encontrada');
	const tableNumber = Number(params.table);
	const guests = listGuests(tableNumber);
	if (guests.length === 0) error(404, 'Esta mesa todavía no tiene archivos');
	return { tableNumber, guests };
};
