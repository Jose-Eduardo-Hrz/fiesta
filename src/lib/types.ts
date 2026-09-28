import type { MediaKind } from './config';

/** Respuesta de POST /api/submissions */
export interface CreateSubmissionResponse {
	submissionId: string;
	uploadToken: string;
}

/** Respuesta de PUT /api/submissions/[id]/files */
export interface UploadFileResponse {
	fileId: string;
	storedName: string;
	kind: MediaKind;
	size: number;
	duplicate: boolean;
}

/** Respuesta de POST /api/submissions/[id]/complete */
export interface CompleteSubmissionResponse {
	images: number;
	videos: number;
}

/** Cuerpo de error que devuelven todos los endpoints. */
export interface ApiErrorBody {
	message: string;
}

/** Archivo tal como lo ve el panel administrativo. */
export interface AdminFile {
	id: string;
	originalName: string;
	storedName: string;
	mimeType: string;
	kind: MediaKind;
	sizeBytes: number;
	uploadedAt: string;
	storageKey: string;
	guestName: string;
	guestSlug: string;
	tableNumber: number;
}

export interface TableSummary {
	tableNumber: number;
	guests: number;
	images: number;
	videos: number;
	totalBytes: number;
	lastUploadAt: string;
}

export interface GuestSummary {
	tableNumber: number;
	guestSlug: string;
	guestName: string;
	images: number;
	videos: number;
	totalBytes: number;
	lastUploadAt: string;
}

export interface EventStats {
	images: number;
	videos: number;
	guests: number;
	tables: number;
	totalBytes: number;
}
