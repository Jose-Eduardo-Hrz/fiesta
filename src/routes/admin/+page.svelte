<script lang="ts">
	import { EVENT } from '$lib/config';
	import { countLabel, formatBytes, formatDateTime, plural } from '$lib/utils/format';
	import StatCard from '$lib/components/admin/StatCard.svelte';
	import DownloadLink from '$lib/components/admin/DownloadLink.svelte';
	import MediaGrid from '$lib/components/admin/MediaGrid.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Panel · {EVENT.title}</title>
</svelte:head>

<div class="page-head">
	<div>
		<h1>Resumen del evento</h1>
		<p>Todos los recuerdos que han compartido los invitados.</p>
	</div>
	{#if data.stats.images + data.stats.videos > 0}
		<DownloadLink href="/api/admin/download" label="Descargar todo (.zip)" variant="primary" />
	{/if}
</div>

<section class="stats" aria-label="Estadísticas">
	<StatCard label="Fotografías" value={data.stats.images} icon="photo" tone="pink" />
	<StatCard label="Videos" value={data.stats.videos} icon="video" tone="blue" />
	<StatCard label="Invitados" value={data.stats.guests} icon="users" tone="violet" />
	<StatCard label="Mesas" value={data.stats.tables} icon="table" tone="amber" />
	<StatCard label="Espacio usado" value={formatBytes(data.stats.totalBytes)} icon="database" tone="green" />
</section>

<section class="block">
	<h2>Mesas</h2>
	{#if data.tables.length === 0}
		<p class="empty">Aún no se ha recibido ningún archivo. Comparte el enlace o el código QR con tus invitados.</p>
	{:else}
		<ul class="tables">
			{#each data.tables as t (t.tableNumber)}
				<li>
					<a class="table-link" href="/admin/mesa/{t.tableNumber}">
						<span class="table-num">
							<small>Mesa</small>
							{t.tableNumber}
						</span>
						<span class="table-info">
							<strong>{plural(t.guests, 'invitado', 'invitados')}</strong>
							<span>{countLabel(t.images, t.videos)} · {formatBytes(t.totalBytes)}</span>
							<span class="muted">Último: {formatDateTime(t.lastUploadAt)}</span>
						</span>
						<Icon name="next" size={18} />
					</a>
					<DownloadLink href="/api/admin/download?mesa={t.tableNumber}" label="Descargar mesa {t.tableNumber}" variant="icon" />
				</li>
			{/each}
		</ul>
	{/if}
</section>

{#if data.recent.length > 0}
	<section class="block">
		<div class="block-head">
			<h2>Recién llegados</h2>
			<a href="/admin/archivos">Ver todos →</a>
		</div>
		<MediaGrid files={data.recent} />
	</section>
{/if}

<style>
	.page-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	h1 {
		font-family: var(--font-body);
		font-size: 1.55rem;
		font-weight: 800;
	}

	.page-head p {
		color: #6c6879;
	}

	h2 {
		font-family: var(--font-body);
		font-size: 1.1rem;
		font-weight: 800;
		margin-bottom: 0.8rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	@media (min-width: 720px) {
		.stats {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	.block {
		margin-top: 2rem;
	}

	.block-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.block-head a {
		color: #6f55c2;
		font-weight: 700;
		font-size: 0.9rem;
		text-decoration: none;
	}

	.empty {
		padding: 2rem;
		text-align: center;
		color: #6c6879;
		background: #fff;
		border: 1px dashed #d9d5e3;
		border-radius: 12px;
	}

	.tables {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	.tables li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem 0.6rem 0.6rem;
		background: #fff;
		border: 1px solid #e6e4ec;
		border-radius: 12px;
		transition: border-color 0.15s;
	}

	.tables li:hover {
		border-color: #cfc6ee;
	}

	.table-link {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		min-width: 0;
		text-decoration: none;
		color: inherit;
	}

	.table-num {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		flex-shrink: 0;
		border-radius: 12px;
		background: #f0ecfb;
		color: #6f55c2;
		font-size: 1.35rem;
		font-weight: 800;
		line-height: 1;
	}

	.table-num small {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.table-info {
		flex: 1;
		display: grid;
		min-width: 0;
		line-height: 1.35;
		font-size: 0.86rem;
	}

	.table-info strong {
		font-size: 0.95rem;
	}

	.muted {
		color: #6c6879;
		font-size: 0.78rem;
	}
</style>
