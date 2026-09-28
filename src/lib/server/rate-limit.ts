/**
 * Limitador de peticiones en memoria (ventana fija).
 * Suficiente para un único servidor; con varias instancias usa Redis.
 */
interface Bucket {
	count: number;
	resetAt: number;
}

export class RateLimiter {
	private readonly buckets = new Map<string, Bucket>();

	constructor(
		private readonly max: number,
		private readonly windowMs: number
	) {}

	/** Registra un intento. Devuelve false si se superó el límite. */
	hit(key: string): boolean {
		const now = Date.now();
		this.sweep(now);
		const bucket = this.buckets.get(key);
		if (!bucket || bucket.resetAt <= now) {
			this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
			return true;
		}
		bucket.count++;
		return bucket.count <= this.max;
	}

	isBlocked(key: string): boolean {
		const bucket = this.buckets.get(key);
		return !!bucket && bucket.resetAt > Date.now() && bucket.count >= this.max;
	}

	reset(key: string): void {
		this.buckets.delete(key);
	}

	private sweep(now: number): void {
		if (this.buckets.size < 5000) return;
		for (const [key, bucket] of this.buckets) {
			if (bucket.resetAt <= now) this.buckets.delete(key);
		}
	}
}

/** 5 intentos de inicio de sesión fallidos cada 15 minutos por IP. */
export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000);
/** Envíos nuevos por IP (varios invitados pueden compartir el Wi-Fi del salón). */
export const submissionLimiter = new RateLimiter(120, 10 * 60 * 1000);
