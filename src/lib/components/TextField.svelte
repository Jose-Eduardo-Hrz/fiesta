<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		label: string;
		value: string;
		error?: string;
		hint?: string;
	}

	let { label, value = $bindable(), error, hint, id, ...rest }: Props = $props();
	const fallbackId = $props.id();
	const inputId = $derived(id ?? fallbackId);
</script>

<div class="field" class:invalid={!!error}>
	<label for={inputId}>{label}</label>
	<input
		id={inputId}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
		{...rest}
	/>
	{#if error}
		<p class="error" id="{inputId}-error">{error}</p>
	{:else if hint}
		<p class="hint" id="{inputId}-hint">{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.4rem;
	}

	label {
		font-weight: 800;
		font-size: 0.98rem;
		color: var(--ink);
	}

	input {
		width: 100%;
		min-height: 56px;
		padding: 0.8rem 1.1rem;
		font-size: 1.1rem; /* ≥16px evita el zoom automático en iOS */
		border-radius: 16px;
		border: 2px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		appearance: none;
	}

	input::placeholder {
		color: var(--ink-muted);
		opacity: 0.8;
	}

	input:focus {
		outline: none;
		border-color: var(--lilac);
		box-shadow: 0 0 0 4px rgb(185 165 239 / 0.3);
	}

	.invalid input {
		border-color: #eaa0b2;
		background: #fffafb;
	}

	.error {
		color: var(--danger);
		font-size: 0.92rem;
		font-weight: 700;
	}

	.hint {
		color: var(--ink-muted);
		font-size: 0.9rem;
	}
</style>
