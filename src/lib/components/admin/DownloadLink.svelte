<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		href: string;
		label: string;
		variant?: 'primary' | 'secondary' | 'icon';
		title?: string;
	}

	let { href, label, variant = 'secondary', title }: Props = $props();
</script>

<!-- data-sveltekit-reload: descarga directa del navegador, sin router -->
<a class="dl {variant}" {href} download data-sveltekit-reload title={title ?? label} aria-label={variant === 'icon' ? label : undefined}>
	<Icon name="download" size={variant === 'icon' ? 18 : 17} />
	{#if variant !== 'icon'}<span>{label}</span>{/if}
</a>

<style>
	.dl {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 38px;
		padding: 0.45rem 0.85rem;
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.88rem;
		text-decoration: none;
		white-space: nowrap;
		transition:
			background-color 0.15s,
			border-color 0.15s;
	}

	.primary {
		background: #6f55c2;
		color: #fff;
	}

	.primary:hover {
		background: #5d45ad;
	}

	.secondary {
		background: #fff;
		color: #24212e;
		border: 1px solid #e6e4ec;
	}

	.secondary:hover {
		background: #f6f6f9;
		border-color: #d4d0de;
	}

	.icon {
		width: 38px;
		padding: 0;
		background: #fff;
		color: #24212e;
		border: 1px solid #e6e4ec;
	}

	.icon:hover {
		color: #6f55c2;
		border-color: #cfc6ee;
	}
</style>
