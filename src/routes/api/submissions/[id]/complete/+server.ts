import { json, type RequestHandler } from '@sveltejs/kit';
import { completeSubmission, getSubmission } from '$lib/server/db';
import { verifyUploadToken } from '$lib/server/uploads';
import { apiError, handleApiError, isUuid } from '$lib/server/http';
import type { CompleteSubmissionResponse } from '$lib/types';

/** Marca el envío como terminado y devuelve el resumen para la pantalla de agradecimiento. */
export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const submissionId = params.id;
		if (!isUuid(submissionId) || !verifyUploadToken(submissionId, request.headers.get('x-upload-token'))) {
			return apiError(403, 'Tu sesión de envío no es válida.');
		}
		if (!getSubmission(submissionId)) return apiError(404, 'No encontramos tu envío.');

		const counts: CompleteSubmissionResponse = completeSubmission(submissionId);
		return json(counts, { headers: { 'Cache-Control': 'no-store' } });
	} catch (err) {
		return handleApiError(err, 'submissions:complete');
	}
};
