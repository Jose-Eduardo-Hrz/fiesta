<script lang="ts">
	import { base } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { beforeNavigate } from '$app/navigation';
	import { EVENT } from '$lib/config';
	import { firstName, loadGuest } from '$lib/client/guest';
	import { UploadQueue } from '$lib/client/upload-queue.svelte';
	import type { GuestInput } from '$lib/validation';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import FileUploader from '$lib/components/FileUploader.svelte';
	import FileList from '$lib/components/FileList.svelte';
	import UploadProgress from '$lib/components/UploadProgress.svelte';
	import Button from '$lib/components/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const queue = new UploadQueue();
	let guest = $state<GuestInput | null>(null);
	let wakeLock: WakeLockSentinel | null = null;

	onMount(() => {
		guest = loadGuest();
		if (!guest) goto(`${base}/`, { replaceState: true });
	});

	onDestroy(() => {
		queue.destroy();
		void releaseWakeLock();
	});

	// Avisar antes de salir si hay una subida en curso o archivos sin enviar.
	beforeNavigate(({ cancel, type, to }) => {
		const pending = queue.isBusy || (queue.items.length > 0 && queue.phase !== 'finished');
		if (!pending || to?.url.pathname === '/success') return;
		if (type === 'leave') {
			cancel(); // muestra el aviso nativo del navegador
			return;
		}
		if (!confirm('Tus fotos todavía no se han enviado. ¿Seguro que quieres salir?')) cancel();
	});

	/** Evita que la pantalla se apague (y la subida se pause) en el celular. */
	async function requestWakeLock() {
		try {
			if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
		} catch {
			/* no soportado o sin permiso: no es crítico */
		}
	}

	async function releaseWakeLock() {
		try {
			await wakeLock?.release();
		} catch {
			/* ignorado */
		}
		wakeLock = null;
	}

	async function share() {
		if (!guest || queue.isBusy) return;
		await requestWakeLock();
		const summary = await queue.start(guest);
		await releaseWakeLock();
		if (summary) {
			const params = new URLSearchParams({ fotos: String(summary.images), videos: String(summary.videos) });
			goto(`${base}/success?${params}`, { replaceState: true });
		} else {
			document.getElementById('upload-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	const buttonLabel = $derived(
		queue.isBusy
			? `Subiendo ${Math.min(queue.doneCount + 1, queue.items.length)} de ${queue.items.length}…`
			: queue.phase === 'failed' && queue.failedCount > 0
				? 'Reintentar archivos pendientes'
				: 'Compartir mis recuerdos'
	);
</script>

<svelte:head>
	<title>Comparte tus fotos · {EVENT.title}</title>
</svelte:head>

{#if guest}
	<div class="stack">
		<Header variant="compact" />

		<div class="greeting">
			<h1>¡Hola, {firstName(guest.name)}! <span aria-hidden="true">💕</span></h1>
			<p class="guest-pill">
				<Icon name="table" size={16} />
				<span>{guest.name} · Mesa {guest.table}</span>
				{#if !queue.isBusy}
					<a href="{base}/">Cambiar</a>
				{/if}
			</p>
		</div>

		<Card>
			<div class="content">
				<div>
					<h2>Tus fotos y videos</h2>
					<p class="lead">Elige todos los que quieras compartir; puedes seleccionar varios a la vez.</p>
				</div>

				<FileUploader onfiles={(files) => queue.add(files)} disabled={queue.isBusy} hasFiles={queue.items.length > 0} />

				{#if queue.rejections.length > 0}
					<Alert tone="warning" title="Algunos archivos no se agregaron" onclose={() => queue.clearRejections()}>
						<ul class="rejections">
							{#each queue.rejections as message, i (i)}
								<li>{message}</li>
							{/each}
						</ul>
					</Alert>
				{/if}

				{#if queue.items.length > 0}
					<FileList
						items={queue.items}
						images={queue.images}
						videos={queue.videos}
						totalBytes={queue.totalBytes}
						removable={!queue.isBusy}
						onremove={(id) => queue.remove(id)}
					/>
				{:else}
					<div class="empty">
						<p>Aún no has elegido archivos.</p>
					</div>
				{/if}

				<div id="upload-status" class="status">
					{#if queue.isBusy}
						<UploadProgress
							progress={queue.progress}
							uploadedBytes={queue.uploadedBytes}
							totalBytes={queue.totalBytes}
							done={queue.doneCount}
							total={queue.items.length}
						/>
					{/if}
					{#if queue.error}
						<Alert tone="error">{queue.error}</Alert>
					{/if}
				</div>
			</div>
		</Card>
	</div>

	{#if queue.items.length > 0}
		<div class="action-bar">
			<div class="action-inner">
				<Button size="lg" block loading={queue.isBusy} onclick={share}>
					{#if !queue.isBusy}
						<Icon name={queue.phase === 'failed' ? 'refresh' : 'heart'} size={22} />
					{/if}
					{buttonLabel}
				</Button>
			</div>
		</div>
	{/if}
{/if}

<style>
	.stack {
		display: grid;
		gap: 1.25rem;
		padding-bottom: 6.5rem; /* espacio para la barra fija */
	}

	.greeting {
		text-align: center;
		display: grid;
		justify-items: center;
		gap: 0.6rem;
	}

	h1 {
		font-size: clamp(1.7rem, 7vw, 2.2rem);
	}

	.guest-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		flex-wrap: wrap;
		justify-content: center;
		padding: 0.4rem 0.9rem;
		border-radius: var(--radius-pill);
		background: rgb(255 255 255 / 0.8);
		border: 1px solid var(--line);
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--ink-soft);
	}

	.guest-pill a {
		font-weight: 800;
		color: var(--berry);
		padding: 0.2rem 0.3rem;
	}

	.content {
		display: grid;
		gap: 1.25rem;
	}

	h2 {
		font-size: 1.4rem;
	}

	.lead {
		color: var(--ink-soft);
		font-size: 0.97rem;
		margin-top: 0.25rem;
	}

	.rejections {
		margin: 0;
		padding-left: 1.1rem;
		display: grid;
		gap: 0.2rem;
	}

	.empty {
		text-align: center;
		color: var(--ink-muted);
		font-size: 0.92rem;
	}

	.status {
		display: grid;
		gap: 0.8rem;
	}

	.status:empty {
		display: none;
	}

	.action-bar {
		position: fixed;
		inset: auto 0 0;
		z-index: 10;
		padding: 0.8rem 1rem max(0.9rem, env(safe-area-inset-bottom));
		background: linear-gradient(180deg, rgb(255 250 246 / 0), rgb(255 250 246 / 0.95) 35%);
		animation: slide-up 0.4s var(--ease-out);
	}

	.action-inner {
		max-width: 560px;
		margin: 0 auto;
	}

	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: none;
		}
	}
</style>
