<script lang="ts">
	import { base } from '$app/paths';
	import { countLabel, formatBytes } from '$lib/utils/format';
	import Breadcrumbs from '$lib/components/admin/Breadcrumbs.svelte';
	import DownloadLink from '$lib/components/admin/DownloadLink.svelte';
	import MediaGrid from '$lib/components/admin/MediaGrid.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const images = $derived(data.files.filter((f) => f.kind === 'image').length);
	const videos = $derived(data.files.length - images);
	const bytes = $derived(data.files.reduce((s, f) => s + f.sizeBytes, 0));
</script>

<svelte:head>
	<title>{data.guestName} · Mesa {data.tableNumber} · Panel</title>
</svelte:head>

<Breadcrumbs
	items={[
		{ label: 'Resumen', href: `${base}/admin` },
		{ label: `Mesa ${data.tableNumber}`, href: `${base}/admin/mesa/${data.tableNumber}` },
		{ label: data.guestName }
	]}
/>

<div class="page-head">
	<div>
		<h1>{data.guestName}</h1>
		<p>Mesa {data.tableNumber} · {countLabel(images, videos)} · {formatBytes(bytes)}</p>
	</div>
	<DownloadLink
		href="{base}/api/admin/download?mesa={data.tableNumber}&invitado={data.guestSlug}"
		label="Descargar todo de {data.guestName.split(' ')[0]} (.zip)"
		variant="primary"
	/>
</div>

<MediaGrid files={data.files} showGuest={false} />

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
</style>
