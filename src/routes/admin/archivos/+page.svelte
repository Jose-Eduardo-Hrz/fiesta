<script lang="ts">
	import Breadcrumbs from '$lib/components/admin/Breadcrumbs.svelte';
	import DownloadLink from '$lib/components/admin/DownloadLink.svelte';
	import MediaGrid from '$lib/components/admin/MediaGrid.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const filters = [
		{ value: 'todos', label: 'Todos' },
		{ value: 'fotos', label: 'Fotos' },
		{ value: 'videos', label: 'Videos' }
	] as const;

	function href(filter: string, page = 1): string {
		const params = new URLSearchParams();
		if (filter !== 'todos') params.set('tipo', filter);
		if (page > 1) params.set('pagina', String(page));
		const qs = params.toString();
		return `/admin/archivos${qs ? `?${qs}` : ''}`;
	}
</script>

<svelte:head>
	<title>Todos los archivos · Panel</title>
</svelte:head>

<Breadcrumbs items={[{ label: 'Resumen', href: '/admin' }, { label: 'Todos los archivos' }]} />

<div class="page-head">
	<div>
		<h1>Todos los archivos</h1>
		<p>{data.total} {data.total === 1 ? 'archivo' : 'archivos'}, del más reciente al más antiguo.</p>
	</div>
	{#if data.total > 0}
		<DownloadLink href="/api/admin/download" label="Descargar todo (.zip)" variant="primary" />
	{/if}
</div>

<div class="filters" role="group" aria-label="Filtrar por tipo">
	{#each filters as f (f.value)}
		<a href={href(f.value)} class:active={data.filter === f.value} aria-current={data.filter === f.value ? 'true' : undefined}>
			{f.label}
		</a>
	{/each}
</div>

<MediaGrid files={data.files} />

{#if data.pages > 1}
	<nav class="pager" aria-label="Páginas">
		{#if data.page > 1}
			<a href={href(data.filter, data.page - 1)}>← Anterior</a>
		{/if}
		<span>Página {data.page} de {data.pages}</span>
		{#if data.page < data.pages}
			<a href={href(data.filter, data.page + 1)}>Siguiente →</a>
		{/if}
	</nav>
{/if}

<style>
	.page-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	h1 {
		font-family: var(--font-body);
		font-size: 1.55rem;
		font-weight: 800;
	}

	.page-head p {
		color: #6c6879;
	}

	.filters {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem;
		margin-bottom: 1rem;
		background: #fff;
		border: 1px solid #e6e4ec;
		border-radius: 10px;
	}

	.filters a {
		padding: 0.4rem 0.9rem;
		border-radius: 7px;
		font-weight: 700;
		font-size: 0.88rem;
		color: #6c6879;
		text-decoration: none;
	}

	.filters a.active {
		background: #f0ecfb;
		color: #6f55c2;
	}

	.pager {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 1.5rem;
		font-size: 0.9rem;
		color: #6c6879;
	}

	.pager a {
		padding: 0.45rem 0.9rem;
		border-radius: 8px;
		background: #fff;
		border: 1px solid #e6e4ec;
		color: #24212e;
		text-decoration: none;
		font-weight: 700;
	}
</style>
