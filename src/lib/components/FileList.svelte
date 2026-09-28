<script lang="ts">
	import type { SelectedFile } from '$lib/client/upload-queue.svelte';
	import { countLabel, formatBytes } from '$lib/utils/format';
	import FilePreview from './FilePreview.svelte';

	interface Props {
		items: SelectedFile[];
		images: number;
		videos: number;
		totalBytes: number;
		removable: boolean;
		onremove: (id: string) => void;
	}

	let { items, images, videos, totalBytes, removable, onremove }: Props = $props();
</script>

<div class="file-list">
	<p class="summary">
		<strong>{countLabel(images, videos)}</strong>
		<span>· {formatBytes(totalBytes)}</span>
	</p>
	<ul class="grid">
		{#each items as item (item.id)}
			<FilePreview {item} {removable} {onremove} />
		{/each}
	</ul>
</div>

<style>
	.file-list {
		display: grid;
		gap: 0.8rem;
	}

	.summary {
		font-size: 0.98rem;
		color: var(--ink-soft);
	}

	.summary strong {
		color: var(--ink);
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		gap: 0.9rem 0.7rem;
	}

	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(124px, 1fr));
		}
	}
</style>
