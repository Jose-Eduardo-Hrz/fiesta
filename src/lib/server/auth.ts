/**
 * Autenticación del anfitrión.
 *
 * - Usuario y contraseña vienen de ADMIN_USERNAME / ADMIN_PASSWORD.
 * - La sesión es una cookie httpOnly firmada con HMAC (SESSION_SECRET):
 *   no puede leerse desde JavaScript ni falsificarse sin el secreto.
 * - La firma incluye una huella de la contraseña, así que al cambiar la
 *   contraseña todas las sesiones anteriores quedan invalidadas.
 */
import type { Cookies } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import { getAdminCredentials } from './env';
import { safeEqual, sign, verifySignature } from './crypto';
import { base } from '$app/paths';

export const SESSION_COOKIE = 'bs_admin_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 horas

interface SessionPayload {
	u: string;
	exp: number;
}

function passwordFingerprint(password: string): string {
	return createHash('sha256').update(password).digest('base64url').slice(0, 16);
}

function sessionContext(password: string): string {
	return `admin-session:${passwordFingerprint(password)}`;
}

export function checkCredentials(username: string, password: string): boolean {
	const creds = getAdminCredentials();
	if (!creds) return false;
	// Ambas comparaciones se ejecutan siempre (sin cortocircuito) para no filtrar cuál falló.
	const userOk = safeEqual(username.trim(), creds.username);
	const passOk = safeEqual(password, creds.password);
	return userOk && passOk;
}

/**
 * `secure` debe ser true cuando el sitio se sirve por HTTPS. Se decide según
 * el protocolo real (ORIGIN), no según dev/producción: así el panel también
 * funciona en pruebas locales por http://localhost o por la IP de la red.
 */
export function createSession(cookies: Cookies, username: string, secure: boolean): void {
	const creds = getAdminCredentials();
	if (!creds) throw new Error('Panel no configurado');
	const payload: SessionPayload = { u: username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
	const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const token = `${encoded}.${sign(sessionContext(creds.password), encoded)}`;

	cookies.set(SESSION_COOKIE, token, {
		path: base || '/',
		httpOnly: true,
		sameSite: 'strict',
		secure,
		maxAge: SESSION_TTL_SECONDS
	});
}

export function destroySession(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: base || '/' });
}

export function readSession(cookies: Cookies): { username: string } | null {
	const token = cookies.get(SESSION_COOKIE);
	const creds = getAdminCredentials();
	if (!token || !creds) return null;

	const [encoded, signature, extra] = token.split('.');
	if (!encoded || !signature || extra !== undefined) return null;
	if (!verifySignature(sessionContext(creds.password), encoded, signature)) return null;

	try {
		const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<SessionPayload>;
		if (typeof payload.u !== 'string' || typeof payload.exp !== 'number') return null;
		if (payload.exp < Date.now() / 1000) return null;
		if (!safeEqual(payload.u, creds.username)) return null;
		return { username: payload.u };
	} catch {
		return null;
	}
}

export function isAdminConfigured(): boolean {
	return getAdminCredentials() !== null;
}
