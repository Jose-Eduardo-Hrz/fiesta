import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// hooks.server.ts ya protege /admin; esta comprobación es defensa en profundidad.
export const load: LayoutServerLoad = ({ locals, url }) => {
	if (!locals.admin) {
		const path = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;
		redirect(303, `${base}/admin/login?next=${encodeURIComponent(path + url.search)}`);
	}
	return { admin: locals.admin };
};
