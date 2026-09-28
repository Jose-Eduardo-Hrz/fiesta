import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// hooks.server.ts ya protege /admin; esta comprobación es defensa en profundidad.
export const load: LayoutServerLoad = ({ locals, url }) => {
	if (!locals.admin) {
		redirect(303, `/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	}
	return { admin: locals.admin };
};
