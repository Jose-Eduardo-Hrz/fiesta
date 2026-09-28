<!--
  Fondo decorativo: nubes que flotan, corazones y estrellas que titilan.
  Solo CSS/SVG, sin imágenes externas. Se desactiva con "reducir movimiento".
-->
<script lang="ts">
	type Sparkle = { kind: 'heart' | 'star'; top: number; left: number; size: number; delay: number; color: string };

	const sparkles: Sparkle[] = [
		{ kind: 'heart', top: 8, left: 8, size: 18, delay: 0, color: '#f6b9cf' },
		{ kind: 'star', top: 14, left: 86, size: 16, delay: 1.2, color: '#ffd978' },
		{ kind: 'heart', top: 34, left: 92, size: 14, delay: 2.1, color: '#b9a5ef' },
		{ kind: 'star', top: 46, left: 4, size: 12, delay: 0.6, color: '#8cc8f0' },
		{ kind: 'heart', top: 62, left: 88, size: 20, delay: 1.7, color: '#f6b9cf' },
		{ kind: 'star', top: 74, left: 10, size: 16, delay: 2.6, color: '#ffd978' },
		{ kind: 'heart', top: 88, left: 52, size: 12, delay: 0.9, color: '#8cc8f0' },
		{ kind: 'star', top: 24, left: 48, size: 10, delay: 3.1, color: '#b9a5ef' }
	];
</script>

<div class="sky" aria-hidden="true">
	<svg class="cloud c1" viewBox="0 0 120 60"><path d="M24 52 C8 52 6 32 22 30 C22 14 44 8 54 22 C62 6 92 10 90 30 C108 28 112 52 94 52Z" /></svg>
	<svg class="cloud c2" viewBox="0 0 120 60"><path d="M24 52 C8 52 6 32 22 30 C22 14 44 8 54 22 C62 6 92 10 90 30 C108 28 112 52 94 52Z" /></svg>
	<svg class="cloud c3" viewBox="0 0 120 60"><path d="M24 52 C8 52 6 32 22 30 C22 14 44 8 54 22 C62 6 92 10 90 30 C108 28 112 52 94 52Z" /></svg>

	{#each sparkles as s, i (i)}
		<svg
			class="sparkle"
			style:top="{s.top}%"
			style:left="{s.left}%"
			style:width="{s.size}px"
			style:animation-delay="{s.delay}s"
			viewBox="0 0 24 24"
			fill={s.color}
		>
			{#if s.kind === 'heart'}
				<path d="M12 21 C5 16 2 12.5 2 8.5 C2 5.4 4.4 3 7.4 3 C9.2 3 10.9 3.9 12 5.3 C13.1 3.9 14.8 3 16.6 3 C19.6 3 22 5.4 22 8.5 C22 12.5 19 16 12 21Z" />
			{:else}
				<path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4Z" />
			{/if}
		</svg>
	{/each}
</div>

<style>
	.sky {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		background: var(--grad-sky);
	}

	.cloud {
		position: absolute;
		fill: #fff;
		opacity: 0.85;
		filter: drop-shadow(0 6px 12px rgb(111 85 194 / 0.08));
		animation: drift linear infinite;
	}

	.c1 {
		width: 150px;
		top: 6%;
		animation-duration: 70s;
		animation-delay: -20s;
	}

	.c2 {
		width: 110px;
		top: 38%;
		opacity: 0.7;
		animation-duration: 90s;
		animation-delay: -55s;
	}

	.c3 {
		width: 180px;
		top: 72%;
		opacity: 0.6;
		animation-duration: 110s;
		animation-delay: -10s;
	}

	.sparkle {
		position: absolute;
		opacity: 0.7;
		animation: twinkle 4s ease-in-out infinite;
	}

	@keyframes drift {
		from {
			transform: translateX(-220px);
		}
		to {
			transform: translateX(calc(100vw + 40px));
		}
	}

	@keyframes twinkle {
		0%,
		100% {
			transform: scale(0.8) rotate(0deg);
			opacity: 0.35;
		}
		50% {
			transform: scale(1.1) rotate(12deg);
			opacity: 0.85;
		}
	}
</style>
