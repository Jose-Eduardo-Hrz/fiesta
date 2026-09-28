<!--
  Foto representativa del evento con marco tipo Polaroid.
  Configura EVENT.heroPhoto en src/lib/config.ts (archivo dentro de static/evento/).
  Si no hay foto configurada se muestra una ilustración.
-->
<script lang="ts">
	import { EVENT } from '$lib/config';
	import Bear from './decor/Bear.svelte';
	import Pascual from './decor/Pascual.svelte';
</script>

<figure class="polaroid">
	<div class="frame">
		{#if EVENT.heroPhoto}
			<img src={EVENT.heroPhoto} alt={EVENT.heroPhotoAlt} loading="lazy" decoding="async" />
		{:else}
			<div class="illustration">
				<div class="moon" aria-hidden="true"></div>
				<div class="family">
					<Bear fur="#9fd2f3" furLight="#e6f4fd" symbol="star" size="38%" delay={200} label="Osito papá" />
					<Bear fur="#f6b9cf" furLight="#fde8f0" symbol="heart" size="26%" delay={600} label="Osita bebé" />
					<Bear fur="#b9a5ef" furLight="#efe9ff" symbol="moon" size="38%" delay={1000} label="Osita mamá" />
				</div>
				<div class="dog"><Pascual size="100%" /></div>
			</div>
		{/if}
	</div>
	<figcaption>{EVENT.dadShort}, {EVENT.momShort}, {EVENT.dog} y muy pronto… {EVENT.babyName.split(' ')[0]} 💕</figcaption>
</figure>

<style>
	.polaroid {
		margin: 0 auto;
		width: min(100%, 360px);
		padding: 12px 12px 14px;
		background: #fff;
		border-radius: 10px;
		box-shadow: var(--shadow-lg);
		transform: rotate(-2deg);
		transition: transform 0.4s var(--ease-spring);
	}

	.polaroid:hover {
		transform: rotate(0deg) scale(1.01);
	}

	.frame {
		aspect-ratio: 4 / 3;
		border-radius: 6px;
		overflow: hidden;
		background: linear-gradient(180deg, #e9f4fd 0%, #f6efff 60%, #fde9f1 100%);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.illustration {
		position: relative;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0 6% 5%;
	}

	.moon {
		position: absolute;
		top: 12%;
		right: 12%;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		box-shadow: -7px 5px 0 0 #ffd978;
		transform: rotate(-20deg);
	}

	.family {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 2%;
		width: 78%;
	}

	.dog {
		position: absolute;
		bottom: 3%;
		right: 3%;
		width: 24%;
	}

	figcaption {
		margin-top: 10px;
		text-align: center;
		font-family: var(--font-script);
		font-size: 1.25rem;
		color: var(--ink-soft);
		line-height: 1.2;
	}
</style>
