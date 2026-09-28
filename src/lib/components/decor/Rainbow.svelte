<script lang="ts">
	interface Props {
		width?: number | string;
	}
	let { width = 280 }: Props = $props();
	const w = $derived(typeof width === 'number' ? `${width}px` : width);
</script>

<svg class="rainbow" style:width={w} viewBox="0 0 300 160" aria-hidden="true">
	<g fill="none" stroke-linecap="round" stroke-width="14">
		<path class="arc a1" d="M30 150 A120 120 0 0 1 270 150" stroke="#f7c3d6" />
		<path class="arc a2" d="M46 150 A104 104 0 0 1 254 150" stroke="#ffe3a3" />
		<path class="arc a3" d="M62 150 A88 88 0 0 1 238 150" stroke="#c8ecd9" />
		<path class="arc a4" d="M78 150 A72 72 0 0 1 222 150" stroke="#cfe6fa" />
		<path class="arc a5" d="M94 150 A56 56 0 0 1 206 150" stroke="#e4dafb" />
	</g>
	<g fill="#fff">
		<circle cx="28" cy="146" r="18" /><circle cx="52" cy="148" r="14" /><circle cx="10" cy="152" r="10" />
		<circle cx="272" cy="146" r="18" /><circle cx="248" cy="148" r="14" /><circle cx="290" cy="152" r="10" />
	</g>
</svg>

<style>
	.rainbow {
		height: auto;
		overflow: visible;
	}

	.arc {
		stroke-dasharray: 400;
		stroke-dashoffset: 400;
		animation: draw 1.6s var(--ease-out) forwards;
	}

	.a2 {
		animation-delay: 0.12s;
	}
	.a3 {
		animation-delay: 0.24s;
	}
	.a4 {
		animation-delay: 0.36s;
	}
	.a5 {
		animation-delay: 0.48s;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
