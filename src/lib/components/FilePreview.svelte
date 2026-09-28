<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { SelectedFile } from '$lib/client/upload-queue.svelte';
	import { formatBytes } from '$lib/utils/format';
	import Icon from './Icon.svelte';

	interface Props {
		item: SelectedFile;
		removable: boolean;
		onremove: (id: string) => void;
	}

	let { item, removable, onremove }: Props = $props();

	/** Algunos formatos (HEIC fuera de Safari) no se pueden previsualizar. */
	let previewFailed = $state(false);
	const percent = $derived(Math.round((item.loaded / Math.max(item.file.size, 1)) * 100));
</script>

<li class="preview {item.status}" transition:scale={{ duration: 200, start: 0.9 }}>
	<div class="thumb">
		{#if item.previewUrl && !previewFailed}
			{#if item.kind === 'image'}
				<img src={item.previewUrl} alt="" loading="lazy" decoding="async" onerror={() => (previewFailed = true)} />
			{:else}
				<!-- #t=0.1 hace que iOS muestre el primer cuadro como miniatura -->
				<video src="{item.previewUrl}#t=0.1" preload="metadata" muted playsinline onerror={() => (previewFailed = true)}></video>
			{/if}
		{:else}
			<div class="placeholder">
				<Icon name={item.kind === 'image' ? 'photo' : 'video'} size={30} />
			</div>
		{/if}

		{#if item.kind === 'video'}
			<span class="badge"><Icon name="play" size={12} /> Video</span>
		{/if}

		{#if item.status === 'uploading'}
			<div class="overlay">
				<svg class="ring" viewBox="0 0 36 36" aria-hidden="true">
					<circle cx="18" cy="18" r="15.5" class="track" />
					<circle cx="18" cy="18" r="15.5" class="bar" style:stroke-dashoffset={97.4 - (97.4 * percent) / 100} />
				</svg>
				<span class="pct">{percent}%</span>
			</div>
		{:else if item.status === 'done'}
			<div class="overlay done" transition:scale={{ duration: 250 }}>
				<span class="check"><Icon name="check" size={22} stroke={3} /></span>
			</div>
		{:else if item.status === 'error'}
			<div class="overlay failed">
				<span class="check"><Icon name="alert" size={20} stroke={2.5} /></span>
			</div>
		{/if}

		{#if removable && item.status !== 'done'}
			<button class="remove" type="button" onclick={() => onremove(item.id)} aria-label="Quitar {item.file.name}">
				<Icon name="close" size={16} stroke={2.8} />
			</button>
		{/if}
	</div>

	<div class="meta">
		<span class="name" title={item.file.name}>{item.file.name}</span>
		<span class="size">{formatBytes(item.file.size)}</span>
		{#if item.error}
			<span class="error">{item.error}</span>
		{/if}
	</div>
</li>

<style>
	.preview {
		display: grid;
		gap: 0.4rem;
		min-width: 0;
	}

	.thumb {
		position: relative;
		aspect-ratio: 1;
		border-radius: 16px;
		overflow: hidden;
		background: var(--surface-soft);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--line);
	}

	img,
	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.placeholder {
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--lilac);
		background: linear-gradient(135deg, var(--blush), var(--lavender));
	}

	.badge {
		position: absolute;
		left: 6px;
		bottom: 6px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		font-size: 0.72rem;
		font-weight: 800;
		color: #fff;
		background: rgb(63 49 80 / 0.65);
		border-radius: var(--radius-pill);
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgb(255 255 255 / 0.55);
		backdrop-filter: blur(1px);
	}

	.ring {
		position: absolute;
		width: 58%;
		transform: rotate(-90deg);
	}

	.ring circle {
		fill: none;
		stroke-width: 3.5;
	}

	.track {
		stroke: rgb(185 165 239 / 0.35);
	}

	.bar {
		stroke: var(--berry);
		stroke-linecap: round;
		stroke-dasharray: 97.4;
		transition: stroke-dashoffset 0.25s linear;
	}

	.pct {
		font-weight: 800;
		font-size: 0.85rem;
		color: var(--ink);
	}

	.done {
		background: rgb(47 138 95 / 0.18);
	}

	.failed {
		background: rgb(179 54 79 / 0.18);
	}

	.check {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: #fff;
		background: var(--success);
		box-shadow: 0 6px 16px -6px rgb(47 138 95 / 0.8);
	}

	.failed .check {
		background: var(--danger);
	}

	.remove {
		position: absolute;
		top: 6px;
		right: 6px;
		width: 34px;
		height: 34px;
		display: grid;
		place-items: center;
		border: 0;
		border-radius: 50%;
		color: var(--ink);
		background: rgb(255 255 255 / 0.92);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		transition: transform 0.15s var(--ease-spring);
	}

	.remove:hover {
		color: var(--danger);
		transform: scale(1.08);
	}

	.meta {
		display: grid;
		min-width: 0;
		font-size: 0.8rem;
		line-height: 1.3;
		padding: 0 2px;
	}

	.name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 700;
		color: var(--ink);
	}

	.size {
		color: var(--ink-muted);
	}

	.error {
		color: var(--danger);
		font-weight: 700;
		font-size: 0.76rem;
	}
</style>
