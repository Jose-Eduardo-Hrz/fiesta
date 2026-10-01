<script lang="ts">
	import { base } from '$app/paths';
	import { countLabel, formatBytes, formatDateTime } from '$lib/utils/format';
	import Breadcrumbs from '$lib/components/admin/Breadcrumbs.svelte';
	import DownloadLink from '$lib/components/admin/DownloadLink.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const totals = $derived(
		data.guests.reduce(
			(acc, g) => ({ images: acc.images + g.images, videos: acc.videos + g.videos, bytes: acc.bytes + g.totalBytes }),
			{ images: 0, videos: 0, bytes: 0 }
		)
	);
</script>

<svelte:head>
	<title>Mesa {data.tableNumber} · Panel</title>
</svelte:head>

<Breadcrumbs items={[{ label: 'Resumen', href: `${base}/admin` }, { label: `Mesa ${data.tableNumber}` }]} />

<div class="page-head">
	<div>
		<h1>Mesa {data.tableNumber}</h1>
		<p>{data.guests.length} {data.guests.length === 1 ? 'invitado' : 'invitados'} · {countLabel(totals.images, totals.videos)} · {formatBytes(totals.bytes)}</p>
	</div>
	<DownloadLink href="{base}/api/admin/download?mesa={data.tableNumber}" label="Descargar mesa (.zip)" variant="primary" />
</div>

<ul class="guests">
	{#each data.guests as g (g.guestSlug)}
		<li>
			<a href="{base}/admin/mesa/{data.tableNumber}/{g.guestSlug}" class="guest-link">
				<span class="avatar" aria-hidden="true">{g.guestName.charAt(0).toUpperCase()}</span>
				<span class="info">
					<strong>{g.guestName}</strong>
					<span>{countLabel(g.images, g.videos)} · {formatBytes(g.totalBytes)}</span>
					<span class="muted">Último: {formatDateTime(g.lastUploadAt)}</span>
				</span>
				<Icon name="next" size={18} />
			</a>
			<DownloadLink
				href="{base}/api/admin/download?mesa={data.tableNumber}&invitado={g.guestSlug}"
				label="Descargar archivos de {g.guestName}"
				variant="icon"
			/>
		</li>
	{/each}
</ul>

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

	.guests {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 0.75rem;
		background: #fff;
		border: 1px solid #e6e4ec;
		border-radius: 12px;
	}

	li:hover {
		border-color: #cfc6ee;
	}

	.guest-link {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
		color: inherit;
		text-decoration: none;
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		flex-shrink: 0;
		border-radius: 50%;
		background: linear-gradient(135deg, #fde4ee, #e4dafb);
		color: #6f55c2;
		font-weight: 800;
		font-size: 1.15rem;
	}

	.info {
		flex: 1;
		display: grid;
		min-width: 0;
		font-size: 0.86rem;
		line-height: 1.35;
	}

	.info strong {
		font-size: 0.97rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.muted {
		color: #6c6879;
		font-size: 0.78rem;
	}
</style>
