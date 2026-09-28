<script lang="ts">
	import { EVENT } from '$lib/config';
	import Bear from './decor/Bear.svelte';
	import Rainbow from './decor/Rainbow.svelte';

	interface Props {
		variant?: 'full' | 'compact';
	}

	let { variant = 'full' }: Props = $props();
</script>

{#if variant === 'full'}
	<header class="hero">
		<div class="art">
			<div class="rainbow"><Rainbow width="100%" /></div>
			<div class="bears">
				<div class="bear side"><Bear fur="#b9a5ef" furLight="#efe9ff" symbol="rainbow" size="100%" delay={400} /></div>
				<div class="bear center">
					<Bear fur="#f6b9cf" furLight="#fde8f0" symbol="heart" size="100%" animate="wave" label="Osito con un corazón en la pancita" />
				</div>
				<div class="bear side"><Bear fur="#9fd2f3" furLight="#e6f4fd" symbol="cloud" size="100%" delay={900} /></div>
			</div>
		</div>

		<p class="eyebrow">Baby Shower</p>
		<h1>
			<span class="visually-hidden">Baby Shower de </span>
			<span class="name">{EVENT.babyName}</span>
		</h1>
		<p class="parents">
			{EVENT.dadShort} <span class="amp">&amp;</span> {EVENT.momShort}
		</p>
		<div class="divider" aria-hidden="true">
			<span></span>
			<svg viewBox="0 0 24 24" width="16" fill="#e98bb0"><path d="M12 21 C5 16 2 12.5 2 8.5 C2 5.4 4.4 3 7.4 3 C9.2 3 10.9 3.9 12 5.3 C13.1 3.9 14.8 3 16.6 3 C19.6 3 22 5.4 22 8.5 C22 12.5 19 16 12 21Z" /></svg>
			<span></span>
		</div>
		<p class="tagline">{EVENT.tagline}</p>
	</header>
{:else}
	<header class="compact">
		<a href="/" class="compact-link" aria-label="Volver al inicio">
			<Bear fur="#f6b9cf" furLight="#fde8f0" symbol="heart" size={46} animate="none" />
			<span>
				<small>Baby Shower de</small>
				<strong>{EVENT.babyName}</strong>
			</span>
		</a>
	</header>
{/if}

<style>
	.hero {
		text-align: center;
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		padding-top: 0.5rem;
	}

	.art {
		position: relative;
		width: min(100%, 360px);
		margin-bottom: 0.5rem;
		animation: rise 0.9s var(--ease-out) both;
	}

	.rainbow {
		position: absolute;
		inset: 0 4% auto;
		opacity: 0.95;
	}

	.bears {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1.35fr 1fr;
		align-items: end;
		gap: 0.25rem;
		padding-top: 22%;
	}

	.bear.side {
		transform: translateY(4px);
	}

	.eyebrow {
		font-family: var(--font-display);
		text-transform: uppercase;
		letter-spacing: 0.32em;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--violet);
		animation: rise 0.9s 0.15s var(--ease-out) both;
	}

	h1 {
		font-weight: 400;
		animation: rise 0.9s 0.25s var(--ease-out) both;
	}

	.name {
		display: inline-block;
		font-family: var(--font-script);
		font-weight: 700;
		font-size: clamp(3rem, 14vw, 5.2rem);
		line-height: 1.05;
		padding: 0 0.1em 0.08em;
		background: var(--grad-name);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 2px 0 rgb(255 255 255 / 0.9));
	}

	.parents {
		font-family: var(--font-display);
		font-size: clamp(1.15rem, 4.8vw, 1.45rem);
		font-weight: 500;
		color: var(--ink);
		animation: rise 0.9s 0.35s var(--ease-out) both;
	}

	.amp {
		font-family: var(--font-script);
		color: var(--berry);
		font-size: 1.2em;
		padding: 0 0.1em;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0.4rem 0;
		animation: rise 0.9s 0.4s var(--ease-out) both;
	}

	.divider span {
		width: 48px;
		height: 1.5px;
		background: linear-gradient(90deg, transparent, var(--rose));
	}

	.divider span:last-child {
		transform: scaleX(-1);
	}

	.tagline {
		max-width: 34ch;
		color: var(--ink-soft);
		font-size: 1.02rem;
		animation: rise 0.9s 0.45s var(--ease-out) both;
	}

	.compact {
		display: flex;
		justify-content: center;
		padding: 0.25rem 0 0.5rem;
	}

	.compact-link {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--ink);
	}

	.compact-link span {
		display: grid;
		line-height: 1.1;
	}

	.compact small {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--violet);
		font-weight: 700;
	}

	.compact strong {
		font-family: var(--font-script);
		font-size: 1.7rem;
		font-weight: 700;
		color: var(--berry);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
