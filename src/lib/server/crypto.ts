import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getSessionSecret } from './env';

/** Firma HMAC-SHA256 con separación de contexto (sesión vs. subidas). */
export function sign(context: string, value: string): string {
	return createHmac('sha256', getSessionSecret()).update(`${context}:${value}`).digest('base64url');
}

/**
 * Comparación en tiempo constante. Se comparan los hashes para que la
 * longitud de los valores tampoco se filtre por tiempo de respuesta.
 */
export function safeEqual(a: string, b: string): boolean {
	const ha = createHash('sha256').update(a).digest();
	const hb = createHash('sha256').update(b).digest();
	return timingSafeEqual(ha, hb);
}

export function verifySignature(context: string, value: string, signature: string): boolean {
	return safeEqual(sign(context, value), signature);
}
