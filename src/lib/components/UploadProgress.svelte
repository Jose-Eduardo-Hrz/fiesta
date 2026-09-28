<script lang="ts">
	import { formatBytes } from '$lib/utils/format';
	import Bear from './decor/Bear.svelte';

	interface Props {
		progress: number;
		uploadedBytes: number;
		totalBytes: number;
		done: number;
		total: number;
	}

	let { progress, uploadedBytes, totalBytes, done, total }: Props = $props();
	const percent = $derived(Math.min(100, Math.round(progress * 100)));
</script>

<div class="upload-progress" role="status" aria-live="polite">
	<div class="head">
		<div class="bear"><Bear fur="#9fd2f3" furLight="#e6f4fd" symbol="star" size={54} animate="bob" /></div>
		<div class="copy">
			<strong>Guardando tus recuerdos…</strong>
			<span>{done} de {total} listos · {formatBytes(uploadedBytes)} de {formatBytes(totalBytes)}</span>
		</div>
		<span class="percent">{percent}%</span>
	</div>
	<div
		class="track"
		role="progressbar"
		aria-label="Progreso de la subida"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={percent}
	>
		<div class="fill" style:width="{percent}%"></div>
	</div>
	<p class="tip">Mantén esta pantalla abierta hasta que termine 💕</p>
</div>

<style>
	.upload-progress {
		display: grid;
		gap: 0.7rem;
		padding: 1rem 1.1rem;
		border-radius: var(--radius);
		background: linear-gradient(135deg, #fff, #f7f3ff);
		border: 1px solid var(--lavender);
	}

	.head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.copy {
		flex: 1;
		display: grid;
		line-height: 1.3;
		min-width: 0;
	}

	.copy strong {
		font-size: 1.02rem;
	}

	.copy span {
		font-size: 0.86rem;
		color: var(--ink-soft);
	}

	.percent {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 700;
		color: var(--violet);
		font-variant-numeric: tabular-nums;
	}

	.track {
		height: 14px;
		border-radius: var(--radius-pill);
		background: var(--lavender);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		border-radius: inherit;
		background:
			repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.25) 0 8px, transparent 8px 16px),
			var(--grad-primary);
		background-size:
			22px 22px,
			100% 100%;
		animation: stripes 1s linear infinite;
		transition: width 0.3s var(--ease-out);
	}

	.tip {
		font-size: 0.85rem;
		color: var(--ink-muted);
		text-align: center;
	}

	@keyframes stripes {
		to {
			background-position:
				22px 0,
				0 0;
		}
	}
</style>
