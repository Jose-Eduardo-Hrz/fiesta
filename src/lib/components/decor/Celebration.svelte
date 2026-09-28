<!-- Lluvia suave de corazones y estrellas para la pantalla de agradecimiento. -->
<script lang="ts">
	const colors = ['#f6b9cf', '#b9a5ef', '#8cc8f0', '#ffd978', '#a8e3c6', '#e98bb0'];
	const pieces = Array.from({ length: 28 }, (_, i) => ({
		left: (i * 37) % 100,
		delay: (i % 7) * 0.45 + Math.floor(i / 7) * 0.2,
		duration: 5 + (i % 5),
		size: 10 + ((i * 7) % 12),
		color: colors[i % colors.length] ?? '#f6b9cf',
		heart: i % 3 !== 0,
		drift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 12)
	}));
</script>

<div class="celebration" aria-hidden="true">
	{#each pieces as p, i (i)}
		<svg
			class="piece"
			style:left="{p.left}%"
			style:width="{p.size}px"
			style:animation-delay="{p.delay}s"
			style:animation-duration="{p.duration}s"
			style:--drift="{p.drift}px"
			viewBox="0 0 24 24"
			fill={p.color}
		>
			{#if p.heart}
				<path d="M12 21 C5 16 2 12.5 2 8.5 C2 5.4 4.4 3 7.4 3 C9.2 3 10.9 3.9 12 5.3 C13.1 3.9 14.8 3 16.6 3 C19.6 3 22 5.4 22 8.5 C22 12.5 19 16 12 21Z" />
			{:else}
				<path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4Z" />
			{/if}
		</svg>
	{/each}
</div>

<style>
	.celebration {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0; /* detrás de la tarjeta */
	}

	.piece {
		position: absolute;
		top: -30px;
		opacity: 0;
		animation-name: fall;
		animation-timing-function: linear;
		animation-iteration-count: 2;
		animation-fill-mode: forwards;
	}

	@keyframes fall {
		0% {
			transform: translate(0, 0) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 0.9;
		}
		85% {
			opacity: 0.8;
		}
		100% {
			transform: translate(var(--drift), 105vh) rotate(260deg);
			opacity: 0;
		}
	}
</style>
