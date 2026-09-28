/**
 * Base de datos: SQLite mediante `node:sqlite` (incluido en Node ≥ 22.13).
 *
 * ¿Por qué SQLite? Un baby shower genera como mucho unos miles de registros;
 * SQLite es un solo archivo, no requiere instalar ni administrar un servidor,
 * es transaccional y se respalda copiando el archivo. Al ser el módulo nativo
 * de Node no hay que compilar dependencias (útil en Windows).
 * Si en el futuro se necesitara PostgreSQL, solo cambia este módulo.
 */
import { DatabaseSync, type SQLOutputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { MediaKind } from '$lib/config';
import type { AdminFile, EventStats, GuestSummary, TableSummary } from '$lib/types';
import { getDatabasePath } from './env';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
	id            TEXT PRIMARY KEY,
	guest_name    TEXT NOT NULL,
	guest_slug    TEXT NOT NULL,
	guest_key     TEXT NOT NULL,          -- guest_slug en minúsculas, para agrupar
	table_number  INTEGER NOT NULL CHECK (table_number > 0),
	created_at    TEXT NOT NULL,
	completed_at  TEXT
);

CREATE TABLE IF NOT EXISTS files (
	id             TEXT PRIMARY KEY,
	submission_id  TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
	client_file_id TEXT NOT NULL,          -- id generado en el navegador (evita duplicados al reintentar)
	original_name  TEXT NOT NULL,
	stored_name    TEXT NOT NULL,
	mime_type      TEXT NOT NULL,
	kind           TEXT NOT NULL CHECK (kind IN ('image', 'video')),
	size_bytes     INTEGER NOT NULL,
	storage_key    TEXT NOT NULL UNIQUE,   -- p. ej. mesa-5/Juan-Perez/IMG_001.jpg
	uploaded_at    TEXT NOT NULL,
	UNIQUE (submission_id, client_file_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_guest ON submissions (table_number, guest_key);
CREATE INDEX IF NOT EXISTS idx_files_submission ON files (submission_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded ON files (uploaded_at);
`;

const globalForDb = globalThis as unknown as { __babyShowerDb?: DatabaseSync };

function db(): DatabaseSync {
	if (!globalForDb.__babyShowerDb) {
		const file = getDatabasePath();
		mkdirSync(path.dirname(file), { recursive: true });
		const database = new DatabaseSync(file);
		database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
		database.exec(SCHEMA);
		globalForDb.__babyShowerDb = database;
	}
	return globalForDb.__babyShowerDb;
}

// ── Conversión segura de filas ──────────────────────────────────────────

type Row = Record<string, SQLOutputValue>;

function str(row: Row, key: string): string {
	const v = row[key];
	return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function num(row: Row, key: string): number {
	const v = row[key];
	return typeof v === 'number' ? v : typeof v === 'bigint' ? Number(v) : Number(v ?? 0);
}

function kind(row: Row, key: string): MediaKind {
	return str(row, key) === 'video' ? 'video' : 'image';
}

// ── Envíos ──────────────────────────────────────────────────────────────

export interface SubmissionRecord {
	id: string;
	guestName: string;
	guestSlug: string;
	tableNumber: number;
	createdAt: string;
	completedAt: string | null;
}

export function createSubmission(s: Omit<SubmissionRecord, 'completedAt'>): void {
	db()
		.prepare(
			`INSERT INTO submissions (id, guest_name, guest_slug, guest_key, table_number, created_at)
			 VALUES (?, ?, ?, ?, ?, ?)`
		)
		.run(s.id, s.guestName, s.guestSlug, s.guestSlug.toLowerCase(), s.tableNumber, s.createdAt);
}

/**
 * Carpeta ya usada por el mismo invitado en la mesa ("Juan-Perez" aunque
 * ahora escriba "juan perez"), para que todos sus archivos queden juntos.
 */
export function findExistingGuestSlug(tableNumber: number, guestSlug: string): string | null {
	const row = db()
		.prepare('SELECT guest_slug FROM submissions WHERE table_number = ? AND guest_key = ? ORDER BY created_at LIMIT 1')
		.get(tableNumber, guestSlug.toLowerCase());
	return row ? str(row, 'guest_slug') : null;
}

export function getSubmission(id: string): SubmissionRecord | null {
	const row = db().prepare('SELECT * FROM submissions WHERE id = ?').get(id);
	if (!row) return null;
	return {
		id: str(row, 'id'),
		guestName: str(row, 'guest_name'),
		guestSlug: str(row, 'guest_slug'),
		tableNumber: num(row, 'table_number'),
		createdAt: str(row, 'created_at'),
		completedAt: row.completed_at == null ? null : str(row, 'completed_at')
	};
}

export function completeSubmission(id: string): { images: number; videos: number } {
	const database = db();
	database.prepare('UPDATE submissions SET completed_at = ? WHERE id = ?').run(new Date().toISOString(), id);
	const row = database
		.prepare(
			`SELECT COALESCE(SUM(kind = 'image'), 0) AS images, COALESCE(SUM(kind = 'video'), 0) AS videos
			 FROM files WHERE submission_id = ?`
		)
		.get(id);
	return { images: row ? num(row, 'images') : 0, videos: row ? num(row, 'videos') : 0 };
}

// ── Archivos ────────────────────────────────────────────────────────────

export interface FileRecord {
	id: string;
	submissionId: string;
	clientFileId: string;
	originalName: string;
	storedName: string;
	mimeType: string;
	kind: MediaKind;
	sizeBytes: number;
	storageKey: string;
	uploadedAt: string;
}

export function countSubmissionFiles(submissionId: string): number {
	const row = db().prepare('SELECT COUNT(*) AS n FROM files WHERE submission_id = ?').get(submissionId);
	return row ? num(row, 'n') : 0;
}

export function findFileByClientId(submissionId: string, clientFileId: string): FileRecord | null {
	const row = db()
		.prepare('SELECT * FROM files WHERE submission_id = ? AND client_file_id = ?')
		.get(submissionId, clientFileId);
	return row ? toFileRecord(row) : null;
}

/** Inserta el registro; devuelve false si ya existía (misma subida reintentada). */
export function insertFile(f: FileRecord): boolean {
	const result = db()
		.prepare(
			`INSERT OR IGNORE INTO files
			 (id, submission_id, client_file_id, original_name, stored_name, mime_type, kind, size_bytes, storage_key, uploaded_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			f.id,
			f.submissionId,
			f.clientFileId,
			f.originalName,
			f.storedName,
			f.mimeType,
			f.kind,
			f.sizeBytes,
			f.storageKey,
			f.uploadedAt
		);
	return Number(result.changes) > 0;
}

function toFileRecord(row: Row): FileRecord {
	return {
		id: str(row, 'id'),
		submissionId: str(row, 'submission_id'),
		clientFileId: str(row, 'client_file_id'),
		originalName: str(row, 'original_name'),
		storedName: str(row, 'stored_name'),
		mimeType: str(row, 'mime_type'),
		kind: kind(row, 'kind'),
		sizeBytes: num(row, 'size_bytes'),
		storageKey: str(row, 'storage_key'),
		uploadedAt: str(row, 'uploaded_at')
	};
}

// ── Consultas del panel ─────────────────────────────────────────────────

const ADMIN_FILE_SELECT = `
	SELECT f.id, f.original_name, f.stored_name, f.mime_type, f.kind, f.size_bytes,
	       f.uploaded_at, f.storage_key, s.guest_name, s.guest_key, s.table_number
	FROM files f JOIN submissions s ON s.id = f.submission_id`;

function toAdminFile(row: Row): AdminFile {
	return {
		id: str(row, 'id'),
		originalName: str(row, 'original_name'),
		storedName: str(row, 'stored_name'),
		mimeType: str(row, 'mime_type'),
		kind: kind(row, 'kind'),
		sizeBytes: num(row, 'size_bytes'),
		uploadedAt: str(row, 'uploaded_at'),
		storageKey: str(row, 'storage_key'),
		guestName: str(row, 'guest_name'),
		guestSlug: str(row, 'guest_key'),
		tableNumber: num(row, 'table_number')
	};
}

export function getEventStats(): EventStats {
	const row = db()
		.prepare(
			`SELECT COALESCE(SUM(f.kind = 'image'), 0) AS images,
			        COALESCE(SUM(f.kind = 'video'), 0) AS videos,
			        COUNT(DISTINCT s.table_number || '/' || s.guest_key) AS guests,
			        COUNT(DISTINCT s.table_number) AS tables,
			        COALESCE(SUM(f.size_bytes), 0) AS total_bytes
			 FROM files f JOIN submissions s ON s.id = f.submission_id`
		)
		.get();
	return {
		images: row ? num(row, 'images') : 0,
		videos: row ? num(row, 'videos') : 0,
		guests: row ? num(row, 'guests') : 0,
		tables: row ? num(row, 'tables') : 0,
		totalBytes: row ? num(row, 'total_bytes') : 0
	};
}

export function listTables(): TableSummary[] {
	return db()
		.prepare(
			`SELECT s.table_number,
			        COUNT(DISTINCT s.guest_key) AS guests,
			        SUM(f.kind = 'image') AS images,
			        SUM(f.kind = 'video') AS videos,
			        SUM(f.size_bytes) AS total_bytes,
			        MAX(f.uploaded_at) AS last_upload
			 FROM files f JOIN submissions s ON s.id = f.submission_id
			 GROUP BY s.table_number
			 ORDER BY s.table_number`
		)
		.all()
		.map((row) => ({
			tableNumber: num(row, 'table_number'),
			guests: num(row, 'guests'),
			images: num(row, 'images'),
			videos: num(row, 'videos'),
			totalBytes: num(row, 'total_bytes'),
			lastUploadAt: str(row, 'last_upload')
		}));
}

export function listGuests(tableNumber: number): GuestSummary[] {
	return db()
		.prepare(
			`SELECT s.table_number, s.guest_key,
			        (SELECT s2.guest_name FROM submissions s2
			          WHERE s2.table_number = s.table_number AND s2.guest_key = s.guest_key
			          ORDER BY s2.created_at DESC LIMIT 1) AS guest_name,
			        SUM(f.kind = 'image') AS images,
			        SUM(f.kind = 'video') AS videos,
			        SUM(f.size_bytes) AS total_bytes,
			        MAX(f.uploaded_at) AS last_upload
			 FROM files f JOIN submissions s ON s.id = f.submission_id
			 WHERE s.table_number = ?
			 GROUP BY s.table_number, s.guest_key
			 ORDER BY guest_name COLLATE NOCASE`
		)
		.all(tableNumber)
		.map((row) => ({
			tableNumber: num(row, 'table_number'),
			guestSlug: str(row, 'guest_key'),
			guestName: str(row, 'guest_name'),
			images: num(row, 'images'),
			videos: num(row, 'videos'),
			totalBytes: num(row, 'total_bytes'),
			lastUploadAt: str(row, 'last_upload')
		}));
}

export interface FileFilter {
	tableNumber?: number;
	guestSlug?: string;
	kind?: MediaKind;
	limit?: number;
	offset?: number;
}

function buildWhere(filter: FileFilter): { where: string; params: (string | number)[] } {
	const clauses: string[] = [];
	const params: (string | number)[] = [];
	if (filter.tableNumber !== undefined) {
		clauses.push('s.table_number = ?');
		params.push(filter.tableNumber);
	}
	if (filter.guestSlug !== undefined) {
		clauses.push('s.guest_key = ?');
		params.push(filter.guestSlug.toLowerCase());
	}
	if (filter.kind !== undefined) {
		clauses.push('f.kind = ?');
		params.push(filter.kind);
	}
	return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export function listFiles(filter: FileFilter = {}): AdminFile[] {
	const { where, params } = buildWhere(filter);
	let sql = `${ADMIN_FILE_SELECT} ${where} ORDER BY f.uploaded_at DESC, f.id`;
	if (filter.limit !== undefined) {
		sql += ' LIMIT ? OFFSET ?';
		params.push(filter.limit, filter.offset ?? 0);
	}
	return db()
		.prepare(sql)
		.all(...params)
		.map(toAdminFile);
}

export function countFiles(filter: FileFilter = {}): number {
	const { where, params } = buildWhere(filter);
	const row = db()
		.prepare(`SELECT COUNT(*) AS n FROM files f JOIN submissions s ON s.id = f.submission_id ${where}`)
		.get(...params);
	return row ? num(row, 'n') : 0;
}

export function getAdminFile(id: string): AdminFile | null {
	const row = db().prepare(`${ADMIN_FILE_SELECT} WHERE f.id = ?`).get(id);
	return row ? toAdminFile(row) : null;
}
