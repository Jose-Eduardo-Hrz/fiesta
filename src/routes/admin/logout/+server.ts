import { base } from '$app/paths';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { destroySession } from '$lib/server/auth';

// POST (no GET) para que un enlace externo no pueda cerrar la sesión;
// SvelteKit además verifica el Origin de los formularios (CSRF).
export const POST: RequestHandler = ({ cookies }) => {
	destroySession(cookies);
	redirect(303, `${base}/admin/login`);
};
