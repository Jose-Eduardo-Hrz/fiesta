import { json, type RequestHandler } from '@sveltejs/kit';
import { getSubmission } from '$lib/server/db';
import { DISCARD_LIMIT, assertSubmissionOpen, receiveFile, verifyUploadToken } from '$lib/server/uploads';
import { decodeHeaderFileName } from '$lib/server/sanitize';
import { apiError, discardBody, handleApiError, isUuid } from '$lib/server/http';

/**
 * Recibe UN archivo por petición. El cuerpo es el contenido binario tal cual
 * (no multipart) y los metadatos viajan en cabeceras:
 *   X-Upload-Token, X-Client-File-Id, X-File-Name (URI-encoded), Content-Type, Content-Length
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const submissionId = params.id;
		if (!isUuid(submissionId) || !verifyUploadToken(submissionId, request.headers.get('x-upload-token'))) {
			return apiError(403, 'Tu sesión de envío no es válida. Vuelve a la página principal para empezar de nuevo.');
		}

		const submission = getSubmission(submissionId);
		if (!submission) return apiError(404, 'No encontramos tu envío. Vuelve a la página principal.');
		assertSubmissionOpen(submission);

		const clientFileId = request.headers.get('x-client-file-id');
		if (!isUuid(clientFileId)) return apiError(400, 'Petición no válida.');

		const originalName = decodeHeaderFileName(request.headers.get('x-file-name'));
		if (!originalName) return apiError(400, 'El archivo no tiene nombre.');

		const lengthHeader = request.headers.get('content-length');
		const contentLength = lengthHeader && /^\d+$/.test(lengthHeader) ? Number(lengthHeader) : NaN;
		if (!Number.isSafeInteger(contentLength)) return apiError(411, 'No pudimos determinar el tamaño del archivo.');

		if (contentLength === 0) return apiError(400, `«${originalName}» está vacío.`);
		// SvelteKit no expone el cuerpo si falta Content-Type; el cliente siempre lo envía.
		if (!request.body) return apiError(400, 'Petición no válida.');

		const result = await receiveFile({
			submission,
			clientFileId,
			originalName,
			declaredMime: request.headers.get('content-type') ?? '',
			contentLength,
			body: request.body
		});

		return json(result, { status: result.duplicate ? 200 : 201, headers: { 'Cache-Control': 'no-store' } });
	} catch (err) {
		// Si respondemos antes de leer todo el cuerpo, lo descartamos sin cortar la conexión.
		discardBody(request.body, DISCARD_LIMIT);
		return handleApiError(err, 'submissions:upload');
	}
};
