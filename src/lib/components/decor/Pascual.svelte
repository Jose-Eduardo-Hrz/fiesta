<!--
  Pascual, el perrito y hermano mayor de Azul. Ilustración original en SVG.
  Ajusta los colores para que se parezca al verdadero Pascual.
-->
<script lang="ts">
	interface Props {
		coat?: string;
		coatLight?: string;
		ears?: string;
		bandana?: string;
		size?: number | string;
	}

	let { coat = '#f3d7b6', coatLight = '#fff3e4', ears = '#c89568', bandana = '#8cc8f0', size = 120 }: Props = $props();

	const width = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<svg class="pascual" style:width viewBox="0 0 200 200" role="img" aria-label="Ilustración de Pascual, el perrito">
	<ellipse cx="100" cy="192" rx="58" ry="6" fill="#6f55c2" opacity="0.08" />

	<!-- colita -->
	<path class="tail" d="M148 150 C168 140 172 118 162 108" fill="none" stroke={coat} stroke-width="12" stroke-linecap="round" />

	<!-- cuerpo -->
	<ellipse cx="100" cy="152" rx="48" ry="38" fill={coat} />
	<ellipse cx="100" cy="162" rx="26" ry="24" fill={coatLight} />
	<!-- patitas -->
	<ellipse cx="76" cy="184" rx="15" ry="10" fill={coat} />
	<ellipse cx="124" cy="184" rx="15" ry="10" fill={coat} />
	<g fill={ears} opacity="0.6">
		<circle cx="70" cy="186" r="2.5" /><circle cx="76" cy="188" r="2.5" /><circle cx="82" cy="186" r="2.5" />
		<circle cx="118" cy="186" r="2.5" /><circle cx="124" cy="188" r="2.5" /><circle cx="130" cy="186" r="2.5" />
	</g>

	<!-- paliacate -->
	<path d="M62 118 Q100 134 138 118 L128 132 Q100 146 72 132Z" fill={bandana} />
	<path d="M92 134 L100 156 L110 134Z" fill={bandana} />
	<circle cx="100" cy="140" r="2" fill="#fff" /><circle cx="88" cy="132" r="1.6" fill="#fff" /><circle cx="114" cy="132" r="1.6" fill="#fff" />

	<!-- orejas caídas -->
	<g class="ear-left">
		<path d="M58 52 C36 56 30 98 44 110 C54 118 64 100 66 82Z" fill={ears} />
	</g>
	<g class="ear-right">
		<path d="M142 52 C164 56 170 98 156 110 C146 118 136 100 134 82Z" fill={ears} />
	</g>

	<!-- cabeza -->
	<ellipse cx="100" cy="78" rx="46" ry="44" fill={coat} />
	<!-- mancha en el ojo -->
	<ellipse cx="120" cy="70" rx="15" ry="14" fill={ears} opacity="0.55" />

	<!-- ojos -->
	<circle cx="82" cy="72" r="6" fill="#3f3150" />
	<circle cx="118" cy="72" r="6" fill="#3f3150" />
	<circle cx="84" cy="70" r="2" fill="#fff" />
	<circle cx="120" cy="70" r="2" fill="#fff" />
	<ellipse cx="72" cy="90" rx="8" ry="5" fill="#f47ea8" opacity="0.3" />
	<ellipse cx="128" cy="90" rx="8" ry="5" fill="#f47ea8" opacity="0.3" />

	<!-- hocico -->
	<ellipse cx="100" cy="96" rx="22" ry="16" fill={coatLight} />
	<ellipse cx="100" cy="88" rx="8" ry="6" fill="#3f3150" />
	<circle cx="97.5" cy="86.5" r="1.8" fill="#fff" opacity="0.7" />
	<path d="M100 94 V99 M100 99 C96 104 90 103 89 99 M100 99 C104 104 110 103 111 99" fill="none" stroke="#3f3150" stroke-width="2.2" stroke-linecap="round" />
	<!-- lengüita -->
	<path d="M96 103 Q100 113 104 103Z" fill="#f47ea8" />
</svg>

<style>
	.pascual {
		height: auto;
		overflow: visible;
	}

	.tail {
		transform-origin: 148px 150px;
		animation: wag 0.9s ease-in-out infinite alternate;
	}

	.ear-left {
		transform-origin: 60px 54px;
		animation: ear 3.6s ease-in-out infinite;
	}

	.ear-right {
		transform-origin: 140px 54px;
		animation: ear 3.6s ease-in-out infinite reverse;
	}

	@keyframes wag {
		from {
			transform: rotate(-12deg);
		}
		to {
			transform: rotate(14deg);
		}
	}

	@keyframes ear {
		0%,
		100% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(4deg);
		}
	}
</style>
