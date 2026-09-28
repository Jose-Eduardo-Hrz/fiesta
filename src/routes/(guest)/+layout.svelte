<script lang="ts">
	import { EVENT } from '$lib/config';
	import SkyBackground from '$lib/components/decor/SkyBackground.svelte';
	import Pascual from '$lib/components/decor/Pascual.svelte';

	let { children } = $props();
</script>

<SkyBackground />

<div class="page">
	<main>
		{@render children()}
	</main>

	<footer>
		<div class="pascual"><Pascual size={64} /></div>
		<p>
			<strong>{EVENT.dog}</strong>, el hermano mayor, cuida que ningún recuerdo se pierda 🐾
		</p>
		<p class="love">Con amor, {EVENT.dadShort} &amp; {EVENT.momShort}</p>
	</footer>
</div>

<style>
	.page {
		position: relative;
		z-index: 1;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		padding: max(1rem, env(safe-area-inset-top)) 1rem max(1.25rem, env(safe-area-inset-bottom));
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 560px;
		margin: 0 auto;
	}

	footer {
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		margin-top: 2.5rem;
		text-align: center;
		font-size: 0.9rem;
		color: var(--ink-soft);
	}

	.love {
		font-family: var(--font-script);
		font-size: 1.2rem;
		color: var(--berry);
	}
</style>
