<script lang="ts">
	import { UPLOAD_LIMITS } from '$lib/config';
	import { validateGuest, type GuestErrors, type GuestInput } from '$lib/validation';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import TextField from './TextField.svelte';

	interface Props {
		initial?: GuestInput | null;
		onsubmit: (guest: GuestInput) => void;
	}

	let { initial = null, onsubmit }: Props = $props();

	// svelte-ignore state_referenced_locally
	let name = $state(initial?.name ?? '');
	// svelte-ignore state_referenced_locally
	let table = $state(initial ? String(initial.table) : '');
	let errors = $state<GuestErrors>({});
	let submitted = $state(false);

	// Revalida en vivo solo después del primer intento, para no regañar mientras escribe.
	$effect(() => {
		if (!submitted) return;
		const result = validateGuest(name, table);
		errors = result.ok ? {} : result.errors;
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		const result = validateGuest(name, table);
		if (!result.ok) {
			errors = result.errors;
			const firstInvalid = result.errors.name ? 'guest-name' : 'guest-table';
			document.getElementById(firstInvalid)?.focus();
			return;
		}
		onsubmit(result.value);
	}
</script>

<form class="guest-form" onsubmit={handleSubmit} novalidate>
	<TextField
		id="guest-name"
		label="Tu nombre"
		bind:value={name}
		error={errors.name}
		placeholder="Ej. Juan Pérez"
		autocomplete="name"
		autocapitalize="words"
		enterkeyhint="next"
		maxlength={UPLOAD_LIMITS.maxNameLength}
		required
	/>
	<TextField
		id="guest-table"
		label="Número de mesa"
		bind:value={table}
		error={errors.table}
		hint="Lo encuentras en el centro de tu mesa."
		placeholder="Ej. 5"
		inputmode="numeric"
		pattern="[0-9]*"
		enterkeyhint="go"
		maxlength={3}
		autocomplete="off"
		required
	/>
	<Button type="submit" size="lg" block>
		Continuar
		<Icon name="next" size={20} stroke={2.5} />
	</Button>
</form>

<style>
	.guest-form {
		display: grid;
		gap: 1.1rem;
	}
</style>
