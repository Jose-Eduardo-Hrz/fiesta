<!--
  Osito original en SVG (inspirado en la temática, sin usar arte con derechos).
  Colores y símbolo de la pancita configurables.
-->
<script lang="ts">
	export type BellySymbol = 'heart' | 'rainbow' | 'star' | 'cloud' | 'moon';

	interface Props {
		fur?: string;
		furLight?: string;
		symbol?: BellySymbol;
		size?: number | string;
		animate?: 'bob' | 'wave' | 'none';
		delay?: number;
		label?: string;
	}

	let {
		fur = '#f6b9cf',
		furLight = '#fde4ee',
		symbol = 'heart',
		size = 160,
		animate = 'bob',
		delay = 0,
		label
	}: Props = $props();

	const uid = $props.id();
	const width = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<svg
	class="bear {animate}"
	style:width
	style:animation-delay="{delay}ms"
	viewBox="0 0 200 230"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<defs>
		<radialGradient id="{uid}-shade" cx="50%" cy="35%" r="70%">
			<stop offset="0%" stop-color="#fff" stop-opacity="0.35" />
			<stop offset="100%" stop-color="#fff" stop-opacity="0" />
		</radialGradient>
	</defs>

	<!-- sombra -->
	<ellipse cx="100" cy="222" rx="62" ry="7" fill="#6f55c2" opacity="0.08" />

	<!-- pies -->
	<ellipse cx="66" cy="206" rx="25" ry="17" fill={fur} />
	<ellipse cx="134" cy="206" rx="25" ry="17" fill={fur} />
	<ellipse cx="66" cy="208" rx="13" ry="9" fill={furLight} />
	<ellipse cx="134" cy="208" rx="13" ry="9" fill={furLight} />

	<!-- cuerpo -->
	<ellipse cx="100" cy="160" rx="54" ry="52" fill={fur} />
	<ellipse cx="100" cy="166" rx="35" ry="32" fill={furLight} />

	<!-- símbolo de la pancita -->
	<g transform="translate(100 166)">
		{#if symbol === 'heart'}
			<path d="M0 12 C-14 2 -18 -4 -18 -10 C-18 -16 -13 -20 -8 -20 C-4 -20 -1 -18 0 -15 C1 -18 4 -20 8 -20 C13 -20 18 -16 18 -10 C18 -4 14 2 0 12Z" fill="#e45d93" />
			<path d="M-11 -12 C-9 -15 -6 -16 -4 -15" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.7" />
		{:else if symbol === 'rainbow'}
			<g fill="none" stroke-width="4.5" stroke-linecap="round">
				<path d="M-20 6 A20 20 0 0 1 20 6" stroke="#f38fb3" />
				<path d="M-15 6 A15 15 0 0 1 15 6" stroke="#ffd36e" />
				<path d="M-10 6 A10 10 0 0 1 10 6" stroke="#7fd0a8" />
				<path d="M-5 6 A5 5 0 0 1 5 6" stroke="#7fb9ef" />
			</g>
			<circle cx="-18" cy="9" r="6" fill="#fff" />
			<circle cx="-12" cy="10" r="5" fill="#fff" />
			<circle cx="18" cy="9" r="6" fill="#fff" />
			<circle cx="12" cy="10" r="5" fill="#fff" />
		{:else if symbol === 'star'}
			<path d="M0 -19 L5.5 -6 L19 -5.5 L8.5 3.5 L12 17 L0 9.5 L-12 17 L-8.5 3.5 L-19 -5.5 L-5.5 -6Z" fill="#ffc94d" stroke="#f5a623" stroke-width="1.5" stroke-linejoin="round" />
			<circle cx="-4" cy="-3" r="2" fill="#fff" opacity="0.8" />
		{:else if symbol === 'cloud'}
			<g fill="#fff" stroke="#8cc8f0" stroke-width="2">
				<path d="M-17 8 C-24 8 -24 -2 -17 -2 C-17 -11 -5 -13 -2 -6 C2 -14 16 -11 14 -2 C22 -2 22 8 15 8Z" />
			</g>
			<path d="M-8 13 l-2 5 M0 13 l-2 5 M8 13 l-2 5" stroke="#8cc8f0" stroke-width="2.5" stroke-linecap="round" />
		{:else if symbol === 'moon'}
			<path d="M6 -18 A18 18 0 1 0 6 18 A14 14 0 1 1 6 -18Z" fill="#ffd36e" />
			<circle cx="12" cy="-8" r="2" fill="#ffd36e" />
			<circle cx="16" cy="4" r="1.5" fill="#ffd36e" />
		{/if}
	</g>

	<!-- brazos -->
	<g class="arm-left">
		<ellipse cx="50" cy="150" rx="15" ry="27" fill={fur} transform="rotate(28 50 150)" />
	</g>
	<g class="arm-right">
		<ellipse cx="150" cy="150" rx="15" ry="27" fill={fur} transform="rotate(-28 150 150)" />
	</g>

	<!-- orejas -->
	<circle cx="52" cy="46" r="23" fill={fur} />
	<circle cx="148" cy="46" r="23" fill={fur} />
	<circle cx="52" cy="47" r="12" fill={furLight} />
	<circle cx="148" cy="47" r="12" fill={furLight} />

	<!-- cabeza -->
	<ellipse cx="100" cy="86" rx="62" ry="54" fill={fur} />
	<ellipse cx="100" cy="86" rx="62" ry="54" fill="url(#{uid}-shade)" />
	<!-- mechón -->
	<path d="M94 34 C92 26 100 22 104 27 C107 31 102 35 99 32" fill="none" stroke={fur} stroke-width="6" stroke-linecap="round" />

	<!-- cachetes -->
	<ellipse cx="62" cy="104" rx="11" ry="7" fill="#f47ea8" opacity="0.35" />
	<ellipse cx="138" cy="104" rx="11" ry="7" fill="#f47ea8" opacity="0.35" />

	<!-- ojos -->
	<g class="eyes">
		<ellipse cx="77" cy="84" rx="6.5" ry="7.5" fill="#3f3150" />
		<ellipse cx="123" cy="84" rx="6.5" ry="7.5" fill="#3f3150" />
		<circle cx="79.5" cy="81" r="2.4" fill="#fff" />
		<circle cx="125.5" cy="81" r="2.4" fill="#fff" />
	</g>

	<!-- hocico -->
	<ellipse cx="100" cy="108" rx="24" ry="18" fill={furLight} />
	<path d="M100 105 C94 101 91 98.5 91 95.5 C91 93 93 91 95.5 91 C97.4 91 99 92 100 93.6 C101 92 102.6 91 104.5 91 C107 91 109 93 109 95.5 C109 98.5 106 101 100 105Z" fill="#b8467a" />
	<path d="M100 105 V110 M100 110 C97 114 92 114 90 111 M100 110 C103 114 108 114 110 111" fill="none" stroke="#3f3150" stroke-width="2.2" stroke-linecap="round" />
</svg>

<style>
	.bear {
		height: auto;
		overflow: visible;
		transform-origin: 50% 100%;
	}

	.bob {
		animation: bob 4.5s ease-in-out infinite;
	}

	.wave .arm-right {
		transform-origin: 140px 132px;
		animation: wave 2.8s ease-in-out infinite;
	}

	.wave {
		animation: bob 4.5s ease-in-out infinite;
	}

	.eyes {
		transform-origin: 100px 84px;
		animation: blink 5.5s infinite;
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0) rotate(-1.5deg);
		}
		50% {
			transform: translateY(-6px) rotate(1.5deg);
		}
	}

	@keyframes wave {
		0%,
		60%,
		100% {
			transform: rotate(0deg);
		}
		70% {
			transform: rotate(-38deg);
		}
		80% {
			transform: rotate(-18deg);
		}
		90% {
			transform: rotate(-38deg);
		}
	}

	@keyframes blink {
		0%,
		94%,
		100% {
			transform: scaleY(1);
		}
		96% {
			transform: scaleY(0.1);
		}
	}
</style>
