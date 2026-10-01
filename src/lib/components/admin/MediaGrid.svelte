<script lang="ts">
	import { base } from '$app/paths';
	import type { AdminFile } from '$lib/types';
	import { formatBytes, formatDateTime } from '$lib/utils/format';
	import Icon from '../Icon.svelte';
	import DownloadLink from './DownloadLink.svelte';
	import MediaViewer from './MediaViewer.svelte';

	interface Props {
		files: AdminFile[];
		showGuest?: boolean;
	}

	let { files, showGuest = true }: Props = $props();
	let openIndex = $state<number | null>(null);
	let failed = $state<Record<string, boolean>>({});
</script>

{#if files.length === 0}
	<p class="empty">Todavía no hay archivos aquí.</p>
{:else}
	<ul class="grid">
		{#each files as file, i (file.id)}
			<li class="tile">
				<button class="thumb" type="button" onclick={() => (openIndex = i)} aria-label="Ver {file.storedName}">
					{#if file.kind === 'image' && !failed[file.id]}
						<img
							src="{base}/api/admin/files/{file.id}"
							alt=""
							loading="lazy"
							decoding="async"
							onerror={() => (failed[file.id] = true)}
						/>
					{:else if file.kind === 'video'}
						<video src="{base}/api/admin/files/{file.id}#t=0.5" preload="metadata" muted playsinline tabindex="-1"></video>
						<span class="play"><Icon name="play" size={20} /></span>
					{:else}
						<span class="fallback"><Icon name="photo" size={28} /><small>{file.storedName.split('.').pop()?.toUpperCase()}</small></span>
					{/if}
					<span class="kind">{file.kind === 'image' ? 'Foto' : 'Video'}</span>
				</button>
				<div class="meta">
					<div class="text">
						<span class="name" title={file.storedName}>{file.storedName}</span>
						<span class="sub">
							{#if showGuest}{file.guestName} · Mesa {file.tableNumber} · {/if}{formatBytes(file.sizeBytes)}
						</span>
						<span class="sub">{formatDateTime(file.uploadedAt)}</span>
					</div>
					<DownloadLink href="{base}/api/admin/files/{file.id}?download=1" label="Descargar {file.storedName}" variant="icon" />
				</div>
			</li>
		{/each}
	</ul>

	<MediaViewer {files} index={openIndex} onclose={() => (openIndex = null)} onnavigate={(i) => (openIndex = i)} />
{/if}

<style>
	.empty {
		padding: 2rem;
		text-align: center;
		color: #6c6879;
		background: #fff;
		border: 1px dashed #d9d5e3;
		border-radius: 12px;
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.9rem;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		}
	}

	.tile {
		background: #fff;
		border: 1px solid #e6e4ec;
		border-radius: 12px;
		overflow: hidden;
		display: grid;
		transition: box-shadow 0.15s;
	}

	.tile:hover {
		box-shadow: 0 8px 24px -14px rgb(40 30 80 / 0.35);
	}

	.thumb {
		position: relative;
		aspect-ratio: 1;
		padding: 0;
		border: 0;
		background: #f0eff4;
		cursor: zoom-in;
		overflow: hidden;
	}

	.thumb img,
	.thumb video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		transition: transform 0.3s;
	}

	.thumb:hover img,
	.thumb:hover video {
		transform: scale(1.04);
	}

	.play {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: rgb(20 16 30 / 0.6);
		color: #fff;
		padding-left: 3px;
	}

	.fallback {
		height: 100%;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.3rem;
		color: #8e809c;
	}

	.kind {
		position: absolute;
		top: 6px;
		left: 6px;
		padding: 1px 7px;
		font-size: 0.7rem;
		font-weight: 800;
		border-radius: 6px;
		background: rgb(255 255 255 / 0.9);
		color: #24212e;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.6rem;
	}

	.text {
		flex: 1;
		min-width: 0;
		display: grid;
		line-height: 1.3;
	}

	.name {
		font-weight: 700;
		font-size: 0.84rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sub {
		font-size: 0.74rem;
		color: #6c6879;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
