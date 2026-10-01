<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { EVENT } from '$lib/config';
	import { countLabel } from '$lib/utils/format';
	import Card from '$lib/components/Card.svelte';
	import Bear from '$lib/components/decor/Bear.svelte';
	import Celebration from '$lib/components/decor/Celebration.svelte';
	import Icon from '$lib/components/Icon.svelte';

	function readCount(key: string): number {
		const n = Number(page.url.searchParams.get(key));
		return Number.isInteger(n) && n >= 0 && n < 10000 ? n : 0;
	}

	const images = $derived(readCount('fotos'));
	const videos = $derived(readCount('videos'));
	const hasCounts = $derived(images + videos > 0);
</script>

<svelte:head>
	<title>¡Gracias! · {EVENT.title}</title>
</svelte:head>

<Celebration />

<div class="thanks">
	<div class="hug">
		<div class="glow" aria-hidden="true"></div>
		<Bear fur="#f6b9cf" furLight="#fde8f0" symbol="heart" size={190} animate="wave" label="Osito feliz con un corazón" />
	</div>

	<Card>
		<div class="content">
			<p class="eyebrow">Recuerdos guardados</p>
			<h1>¡Muchas gracias por acompañarnos!</h1>

			{#if hasCounts}
				<p class="count">
					<Icon name="check" size={18} stroke={3} />
					Recibimos {countLabel(images, videos)}
				</p>
			{/if}

			<p class="message">
				Gracias por compartir tus fotos y videos y ayudarnos a guardar los recuerdos de este día tan especial para
				<strong>{EVENT.babyName}</strong>.
			</p>

			<div class="signature">
				<span aria-hidden="true">💕</span>
				<p>Con cariño,</p>
				<p class="names">{EVENT.dadShort}, {EVENT.momShort} y {EVENT.babyName}</p>
			</div>

			<a class="again" href="{base}/upload">
				<Icon name="plus" size={20} stroke={2.5} />
				Compartir más recuerdos
			</a>
		</div>
	</Card>
</div>

<style>
	.thanks {
		display: grid;
		gap: 0.5rem;
		padding-top: 1rem;
	}

	.hug {
		position: relative;
		display: grid;
		place-items: center;
		margin-bottom: -1.5rem;
		z-index: 2;
		animation: pop 0.8s var(--ease-spring) both;
	}

	.glow {
		position: absolute;
		width: 220px;
		height: 220px;
		border-radius: 50%;
		background: radial-gradient(circle, rgb(255 255 255 / 0.95), rgb(253 228 238 / 0.6) 50%, transparent 70%);
		animation: breathe 3.5s ease-in-out infinite;
	}

	.content {
		display: grid;
		justify-items: center;
		gap: 1rem;
		text-align: center;
		padding-top: 1rem;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.24em;
		font-size: 0.78rem;
		font-weight: 800;
		color: var(--violet);
	}

	h1 {
		font-size: clamp(1.75rem, 7.5vw, 2.3rem);
		max-width: 16ch;
	}

	.count {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.9rem;
		border-radius: var(--radius-pill);
		background: var(--success-bg);
		color: #1d5a3d;
		font-weight: 800;
		font-size: 0.95rem;
	}

	.message {
		max-width: 36ch;
		color: var(--ink-soft);
		font-size: 1.05rem;
	}

	.signature {
		display: grid;
		gap: 0.1rem;
		margin-top: 0.4rem;
		color: var(--ink-soft);
	}

	.signature span {
		font-size: 1.4rem;
	}

	.names {
		font-family: var(--font-script);
		font-size: 1.65rem;
		line-height: 1.2;
		color: var(--berry);
	}

	.again {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 52px;
		padding: 0.7rem 1.4rem;
		margin-top: 0.5rem;
		border-radius: var(--radius-pill);
		font-weight: 800;
		text-decoration: none;
		color: var(--violet);
		background: #fff;
		box-shadow: inset 0 0 0 2px var(--lavender), var(--shadow-sm);
		transition: transform 0.2s var(--ease-spring);
	}

	.again:hover {
		transform: translateY(-2px);
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.6) translateY(20px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes breathe {
		0%,
		100% {
			transform: scale(0.95);
			opacity: 0.8;
		}
		50% {
			transform: scale(1.08);
			opacity: 1;
		}
	}
</style>
