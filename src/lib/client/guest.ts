/**
 * Datos del invitado guardados en el navegador (solo en su propio celular),
 * para no pedirle nombre y mesa otra vez si comparte más recuerdos después.
 */
import { validateGuest, type GuestInput } from '$lib/validation';

const KEY = 'baby-shower:guest';

export function loadGuest(): GuestInput | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { name?: unknown; table?: unknown };
		const result = validateGuest(parsed.name, parsed.table);
		return result.ok ? result.value : null;
	} catch {
		return null;
	}
}

export function saveGuest(guest: GuestInput): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(guest));
	} catch {
		/* modo privado o almacenamiento bloqueado: no pasa nada */
	}
}

export function firstName(name: string): string {
	return name.split(' ')[0] ?? name;
}
