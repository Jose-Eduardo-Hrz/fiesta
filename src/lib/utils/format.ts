const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
	const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
	const value = bytes / 1024 ** exp;
	const digits = exp === 0 || value >= 100 ? 0 : 1;
	return `${value.toFixed(digits)} ${UNITS[exp]}`;
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
	dateStyle: 'medium',
	timeStyle: 'short'
});

export function formatDateTime(iso: string): string {
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

export function plural(count: number, singular: string, pluralForm: string): string {
	return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function countLabel(images: number, videos: number): string {
	const parts: string[] = [];
	if (images > 0) parts.push(plural(images, 'foto', 'fotos'));
	if (videos > 0) parts.push(plural(videos, 'video', 'videos'));
	return parts.join(' y ') || 'ningún archivo';
}
