<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from './Icon.svelte';

	interface Props {
		tone?: 'error' | 'success' | 'info' | 'warning';
		title?: string;
		onclose?: () => void;
		children: Snippet;
	}

	let { tone = 'error', title, onclose, children }: Props = $props();
	const icon = $derived(tone === 'success' ? 'check' : tone === 'info' ? 'heart' : 'alert');
</script>

<div class="alert {tone}" role={tone === 'error' ? 'alert' : 'status'} transition:fly={{ y: -8, duration: 250 }}>
	<span class="icon"><Icon name={icon} size={20} /></span>
	<div class="content">
		{#if title}<strong>{title}</strong>{/if}
		{@render children()}
	</div>
	{#if onclose}
		<button class="close" type="button" onclick={onclose} aria-label="Cerrar mensaje">
			<Icon name="close" size={18} />
		</button>
	{/if}
</div>

<style>
	.alert {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		padding: 0.9rem 1rem;
		border-radius: var(--radius-sm);
		font-size: 0.97rem;
		line-height: 1.45;
	}

	.content {
		flex: 1;
		display: grid;
		gap: 0.25rem;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.icon {
		margin-top: 1px;
	}

	.error {
		background: var(--danger-bg);
		color: #7d2238;
		box-shadow: inset 0 0 0 1.5px #f6c4cf;
	}
	.error .icon {
		color: var(--danger);
	}

	.success {
		background: var(--success-bg);
		color: #1d5a3d;
		box-shadow: inset 0 0 0 1.5px #bfe7d1;
	}

	.info {
		background: var(--sky);
		color: #22527d;
		box-shadow: inset 0 0 0 1.5px #bcdcf4;
	}

	.warning {
		background: var(--warning-bg);
		color: #6f5311;
		box-shadow: inset 0 0 0 1.5px #f3e0a6;
	}

	.close {
		border: 0;
		background: transparent;
		padding: 4px;
		margin: -4px -4px -4px 0;
		border-radius: 50%;
		cursor: pointer;
		color: inherit;
		opacity: 0.7;
		min-width: 32px;
		min-height: 32px;
		display: grid;
		place-items: center;
	}

	.close:hover {
		opacity: 1;
	}
</style>
