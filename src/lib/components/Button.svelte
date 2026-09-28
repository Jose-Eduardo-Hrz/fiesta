<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'md' | 'lg';
		loading?: boolean;
		block?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		block = false,
		disabled,
		type = 'button',
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class="btn {variant} {size}"
	class:block
	disabled={disabled || loading}
	aria-busy={loading}
	{...rest}
>
	{#if loading}
		<span class="spinner" aria-hidden="true"></span>
	{/if}
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		border: 0;
		border-radius: var(--radius-pill);
		font-weight: 800;
		letter-spacing: 0.01em;
		cursor: pointer;
		text-decoration: none;
		transition:
			transform 0.2s var(--ease-spring),
			box-shadow 0.2s var(--ease-out),
			background-color 0.2s,
			opacity 0.2s;
		-webkit-user-select: none;
		user-select: none;
		touch-action: manipulation;
	}

	.md {
		min-height: 48px;
		padding: 0.7rem 1.4rem;
		font-size: 1rem;
	}

	.lg {
		min-height: 60px;
		padding: 0.9rem 1.8rem;
		font-size: 1.15rem;
	}

	.block {
		width: 100%;
	}

	.primary {
		color: #fff;
		background: var(--grad-primary);
		box-shadow:
			0 12px 24px -10px rgb(212 87 143 / 0.55),
			inset 0 1px 0 rgb(255 255 255 / 0.25);
		text-shadow: 0 1px 1px rgb(80 30 60 / 0.25);
	}

	.primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 16px 30px -12px rgb(212 87 143 / 0.6);
	}

	.secondary {
		color: var(--violet);
		background: var(--surface);
		box-shadow: inset 0 0 0 2px var(--lavender), var(--shadow-sm);
	}

	.secondary:hover:not(:disabled) {
		background: #faf7ff;
	}

	.ghost {
		color: var(--ink-soft);
		background: transparent;
		min-height: 44px;
		padding-inline: 0.8rem;
	}

	.ghost:hover:not(:disabled) {
		color: var(--berry);
	}

	.btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.btn[aria-busy='true'] {
		opacity: 0.9;
		cursor: progress;
	}

	.spinner {
		width: 1.1em;
		height: 1.1em;
		border-radius: 50%;
		border: 2.5px solid currentColor;
		border-right-color: transparent;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
