import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { base } from '$app/paths';
import { readSession } from '$lib/server/auth';
import { apiError } from '$lib/server/http';

/** Único endpoint que acepta cuerpos grandes (el resto, máx. 1 MB). */
const UPLOAD_ROUTE = /^\/api\/submissions\/[^/]+\/files\/?$/;
const MAX_SMALL_BODY = 1024 * 1024;
const UNSAFE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Protección CSRF (sustituye la de SvelteKit, ver svelte.config.js).
 *
 * `Sec-Fetch-Site` lo pone el navegador y ninguna página puede falsificarlo;
 * además los túneles y proxies no lo reescriben, a diferencia de `Origin`.
 * Navegadores antiguos que no lo envían: se compara `Origin` con el origen del servidor.
 */
function isCrossSiteRequest(request: Request, url: URL): boolean {
	if (!UNSAFE_METHODS.includes(request.method)) return false;
	const fetchSite = request.headers.get('sec-fetch-site');
	if (fetchSite) return fetchSite !== 'same-origin' && fetchSite !== 'none';
	const origin = request.headers.get('origin');
	return origin !== null && origin !== url.origin;
}

export const handle: Handle = async ({ event, resolve }) => {
	// Ruta sin el prefijo `base` (p. ej. /pagina_temporal) para comparar con las rutas de la app.
	const fullPath = event.url.pathname;
	const pathname = fullPath.startsWith(base) ? fullPath.slice(base.length) || '/' : fullPath;
	event.locals.admin = readSession(event.cookies);

	if (isCrossSiteRequest(event.request, event.url)) {
		return apiError(403, 'Petición no permitida desde otro sitio.');
	}

	// ── Límite de cuerpo para todo lo que no sea subida de archivos ──
	// En producción BODY_SIZE_LIMIT=Infinity (necesario para videos), así que
	// aquí volvemos a acotar el resto de rutas para evitar abusos.
	if (!['GET', 'HEAD', 'OPTIONS'].includes(event.request.method) && !UPLOAD_ROUTE.test(pathname)) {
		const length = Number(event.request.headers.get('content-length') ?? NaN);
		if (!Number.isFinite(length)) {
			if (event.request.headers.has('transfer-encoding')) return apiError(411, 'Petición no válida.');
		} else if (length > MAX_SMALL_BODY) {
			return apiError(413, 'Petición demasiado grande.');
		}
	}

	// ── Protección del panel del anfitrión ──
	const isAdminPage = pathname === '/admin' || (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login'));
	const isAdminApi = pathname.startsWith('/api/admin');

	if (!event.locals.admin) {
		if (isAdminApi) return apiError(401, 'Tu sesión expiró. Vuelve a iniciar sesión.');
		if (isAdminPage) {
			const next = encodeURIComponent(pathname + event.url.search);
			redirect(303, `${base}/admin/login?next=${next}`);
		}
	}

	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'same-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
	if (isAdminPage || isAdminApi || pathname.startsWith('/admin')) {
		response.headers.set('Cache-Control', 'private, no-store');
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}
	return response;
};

/** Errores inesperados: se registran completos en el servidor y al navegador llega un mensaje genérico. */
export const handleError: HandleServerError = ({ error, event, status }) => {
	if (status !== 404) {
		console.error(`[error] ${event.request.method} ${event.url.pathname}`, error);
	}
	return {
		message:
			status === 404
				? 'No encontramos esta página.'
				: 'Algo salió mal de nuestro lado. Intenta de nuevo en un momento.'
	};
};
