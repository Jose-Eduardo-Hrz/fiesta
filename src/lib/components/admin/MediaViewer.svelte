<!-- Visor a pantalla completa: foto o video, información del archivo y descarga. -->
<script lang="ts">
	import { base } from '$app/paths';
	import type { AdminFile } from '$lib/types';
	import { formatBytes, formatDateTime } from '$lib/utils/format';
	import Icon from '../Icon.svelte';
	import DownloadLink from './DownloadLink.svelte';

	interface Props {
		files: AdminFile[];
		index: number | null;
		onclose: () => void;
		onnavigate: (index: number) => void;
	}

	let { files, index, onclose, onnavigate }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let imageFailed = $state(false);
	const file = $derived(index === null ? null : (files[index] ?? null));

	$effect(() => {
		if (!dialog) return;
		if (file && !dialog.open) dialog.showModal();
		if (!file && dialog.open) dialog.close();
	});

	$effect(() => {
		void file?.id;
		imageFailed = false;
	});

	function go(delta: number) {
		if (index === null || files.length === 0) return;
		onnavigate((index + delta + files.length) % files.length);
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') go(1);
		if (event.key === 'ArrowLeft') go(-1);
	}
</script>

<dialog bind:this={dialog} onclose={onclose} onkeydown={handleKey} aria-label="Visor de archivos">
	{#if file}
		<div class="viewer">
			<div class="stage">
				{#key file.id}
					{#if file.kind === 'image'}
						{#if imageFailed}
							<div class="no-preview">
								<Icon name="photo" size={48} />
								<p>Este navegador no puede mostrar archivos {file.storedName.split('.').pop()?.toUpperCase()}.</p>
								<p>Descárgalo para verlo.</p>
							</div>
						{:else}
							<img src="{base}/api/admin/files/{file.id}" alt={file.originalName} onerror={() => (imageFailed = true)} />
						{/if}
					{:else}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video src="{base}/api/admin/files/{file.id}" controls autoplay playsinline preload="metadata"></video>
					{/if}
				{/key}

				{#if files.length > 1}
					<button class="nav prev" type="button" onclick={() => go(-1)} aria-label="Anterior">
						<Icon name="back" size={26} stroke={2.5} />
					</button>
					<button class="nav next" type="button" onclick={() => go(1)} aria-label="Siguiente">
						<Icon name="next" size={26} stroke={2.5} />
					</button>
				{/if}
			</div>

			<aside class="info">
				<div class="info-head">
					<span class="counter">{(index ?? 0) + 1} / {files.length}</span>
					<button class="close" type="button" onclick={() => dialog?.close()} aria-label="Cerrar visor">
						<Icon name="close" size={22} />
					</button>
				</div>
				<h2 title={file.storedName}>{file.storedName}</h2>
				<dl>
					<dt>Invitado</dt>
					<dd><a href="{base}/admin/mesa/{file.tableNumber}/{file.guestSlug}">{file.guestName}</a></dd>
					<dt>Mesa</dt>
					<dd><a href="{base}/admin/mesa/{file.tableNumber}">Mesa {file.tableNumber}</a></dd>
					<dt>Tipo</dt>
					<dd>{file.kind === 'image' ? 'Foto' : 'Video'} · {file.mimeType}</dd>
					<dt>Tamaño</dt>
					<dd>{formatBytes(file.sizeBytes)}</dd>
					<dt>Subido</dt>
					<dd>{formatDateTime(file.uploadedAt)}</dd>
					<dt>Nombre original</dt>
					<dd class="mono">{file.originalName}</dd>
					<dt>Ruta</dt>
					<dd class="mono">archivos/{file.storageKey}</dd>
				</dl>
				<DownloadLink href="{base}/api/admin/files/{file.id}?download=1" label="Descargar archivo" variant="primary" />
			</aside>
		</div>
	{/if}
</dialog>

<style>
	dialog {
		width: 100vw;
		max-width: 100vw;
		height: 100dvh;
		max-height: 100dvh;
		margin: 0;
		padding: 0;
		border: 0;
		background: #111016;
		color: #fff;
	}

	dialog::backdrop {
		background: rgb(10 8 16 / 0.85);
	}

	.viewer {
		display: grid;
		grid-template-rows: 1fr auto;
		height: 100%;
	}

	.stage {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 0;
		padding: 0.5rem;
	}

	img,
	video {
		max-width: 100%;
		max-height: calc(100dvh - 260px);
		object-fit: contain;
		border-radius: 6px;
	}

	.no-preview {
		display: grid;
		justify-items: center;
		gap: 0.4rem;
		color: #bbb6c9;
		text-align: center;
	}

	.nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 46px;
		height: 46px;
		display: grid;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.12);
		color: #fff;
		cursor: pointer;
	}

	.nav:hover {
		background: rgb(255 255 255 / 0.25);
	}

	.prev {
		left: 0.6rem;
	}

	.next {
		right: 0.6rem;
	}

	.info {
		background: #1c1a24;
		padding: 1rem 1.1rem 1.25rem;
		display: grid;
		gap: 0.7rem;
		align-content: start;
		overflow-y: auto;
		max-height: 45dvh;
	}

	.info-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.counter {
		font-size: 0.82rem;
		color: #a29db3;
		font-variant-numeric: tabular-nums;
	}

	.close {
		width: 40px;
		height: 40px;
		display: grid;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.08);
		color: #fff;
		cursor: pointer;
	}

	h2 {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 800;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.3rem 0.9rem;
		margin: 0;
		font-size: 0.86rem;
	}

	dt {
		color: #a29db3;
	}

	dd {
		margin: 0;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	dd a {
		color: #cbbcff;
	}

	.mono {
		font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
		font-size: 0.8rem;
	}

	@media (min-width: 900px) {
		.viewer {
			grid-template-rows: none;
			grid-template-columns: 1fr 340px;
		}

		img,
		video {
			max-height: calc(100dvh - 2rem);
		}

		.info {
			max-height: none;
			padding: 1.25rem;
		}
	}
</style>
