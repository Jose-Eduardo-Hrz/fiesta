import { json, type RequestHandler } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { validateGuest } from '$lib/validation';
import { createSubmission, findExistingGuestSlug } from '$lib/server/db';
import { slugifyGuestName } from '$lib/server/sanitize';
import { createUploadToken } from '$lib/server/uploads';
import { submissionLimiter } from '$lib/server/rate-limit';
import { apiError, handleApiError } from '$lib/server/http';
import type { CreateSubmissionResponse } from '$lib/types';

/** Crea un "envío": registra al invitado y devuelve un token para subir sus archivos. */
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		if (!submissionLimiter.hit(getClientAddress())) {
			return apiError(429, 'Se han hecho demasiados envíos desde esta red. Espera unos minutos e inténtalo de nuevo.');
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return apiError(400, 'No pudimos leer tus datos. Recarga la página e inténtalo de nuevo.');
		}
		const data = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;

		const result = validateGuest(data.name, data.table);
		if (!result.ok) {
			return apiError(400, result.errors.name ?? result.errors.table ?? 'Revisa tus datos.');
		}

		const id = randomUUID();
		const slug = slugifyGuestName(result.value.name);
		createSubmission({
			id,
			guestName: result.value.name,
			guestSlug: findExistingGuestSlug(result.value.table, slug) ?? slug,
			tableNumber: result.value.table,
			createdAt: new Date().toISOString()
		});

		const response: CreateSubmissionResponse = { submissionId: id, uploadToken: createUploadToken(id) };
		return json(response, { status: 201, headers: { 'Cache-Control': 'no-store' } });
	} catch (err) {
		return handleApiError(err, 'submissions:create');
	}
};
