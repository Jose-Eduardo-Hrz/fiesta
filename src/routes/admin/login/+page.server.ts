import { base } from '$app/paths';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { checkCredentials, createSession, isAdminConfigured } from '$lib/server/auth';
import { loginLimiter } from '$lib/server/rate-limit';

/** Solo se permite volver a rutas internas del panel (evita redirecciones abiertas). */
function safeNext(value: string | null): string {
	if (value && value.startsWith('/admin') && !value.startsWith('//') && !value.includes('\\')) return value;
	return '/admin';
}

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.admin) redirect(303, base + safeNext(url.searchParams.get('next')));
	return {
		configured: isAdminConfigured(),
		expired: url.searchParams.has('next')
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		if (!isAdminConfigured()) {
			return fail(503, { message: 'El panel no está configurado. Define ADMIN_USERNAME y ADMIN_PASSWORD en el archivo .env.', username: '' });
		}

		const ip = getClientAddress();
		if (loginLimiter.isBlocked(ip)) {
			return fail(429, { message: 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.', username: '' });
		}

		const form = await request.formData();
		const username = String(form.get('username') ?? '').slice(0, 200);
		const password = String(form.get('password') ?? '').slice(0, 500);

		if (!username || !password) {
			return fail(400, { message: 'Escribe tu usuario y contraseña.', username });
		}

		if (!checkCredentials(username, password)) {
			loginLimiter.hit(ip);
			// Pequeña espera para frenar ataques de fuerza bruta.
			await new Promise((r) => setTimeout(r, 600));
			return fail(401, { message: 'Usuario o contraseña incorrectos.', username });
		}

		loginLimiter.reset(ip);
		createSession(cookies, username.trim(), url.protocol === 'https:');
		redirect(303, base + safeNext(url.searchParams.get('next')));
	}
};
