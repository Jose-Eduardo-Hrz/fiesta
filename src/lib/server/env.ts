/**
 * Lectura centralizada de variables de entorno del servidor.
 * `$env/dynamic/private` se lee en tiempo de ejecución, por lo que los
 * secretos nunca se incrustan en el código compilado ni llegan al navegador.
 */
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

export interface AdminCredentials {
	username: string;
	password: string;
}

/** Devuelve las credenciales o `null` si el anfitrión no las configuró. */
export function getAdminCredentials(): AdminCredentials | null {
	const username = env.ADMIN_USERNAME?.trim();
	const password = env.ADMIN_PASSWORD;
	if (!username || !password) return null;
	if (!dev && password.length < 10) {
		console.error('[config] ADMIN_PASSWORD debe tener al menos 10 caracteres. Panel deshabilitado.');
		return null;
	}
	return { username, password };
}

let devSecret: string | undefined;

export function getSessionSecret(): string {
	const secret = env.SESSION_SECRET;
	if (secret && secret.length >= 32) return secret;

	if (!dev) {
		throw new Error('SESSION_SECRET no está configurado o tiene menos de 32 caracteres.');
	}
	// En desarrollo generamos uno temporal para que el proyecto arranque
	// sin configuración; las sesiones se pierden al reiniciar el servidor.
	if (!devSecret) {
		devSecret = randomBytes(48).toString('base64url');
		console.warn('[config] SESSION_SECRET no configurado: usando uno temporal (solo desarrollo).');
	}
	return devSecret;
}

export function getStorageDir(): string {
	return path.resolve(env.STORAGE_DIR?.trim() || './archivos');
}

export function getDatabasePath(): string {
	return path.resolve(env.DATABASE_PATH?.trim() || './data/baby-shower.db');
}
