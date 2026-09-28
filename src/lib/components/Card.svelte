<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		padded?: boolean;
		class?: string;
		children: Snippet;
	}

	let { padded = true, class: className = '', children }: Props = $props();
</script>

<section class="card {className}" class:padded>
	{@render children()}
</section>

<style>
	.card {
		position: relative;
		background: rgb(255 255 255 / 0.88);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow), inset 0 0 0 1px rgb(255 255 255 / 0.9);
		border: 1px solid var(--line);
	}

	.padded {
		padding: 1.5rem 1.25rem;
	}

	@media (min-width: 640px) {
		.padded {
			padding: 2rem 2.25rem;
		}
	}
</style>
