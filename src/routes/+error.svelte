<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Bear from '$lib/components/decor/Bear.svelte';

	const isAdmin = $derived(page.url.pathname.startsWith(`${base}/admin`));
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Página no encontrada' : 'Algo salió mal'}</title>
</svelte:head>

<div class="error-page">
	<Bear fur="#b9a5ef" furLight="#efe9ff" symbol="cloud" size={150} />
	<h1>{page.status === 404 ? '¡Ups! Esta página se escondió' : '¡Ups! Algo salió mal'}</h1>
	<p>{page.error?.message ?? 'Intenta de nuevo en un momento.'}</p>
	<a href={isAdmin ? `${base}/admin` : `${base}/`}>{isAdmin ? 'Volver al panel' : 'Volver al inicio'}</a>
</div>

<style>
	.error-page {
		min-height: 100dvh;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 1rem;
		padding: 1.5rem;
		text-align: center;
		background: var(--grad-sky);
	}

	h1 {
		font-size: clamp(1.5rem, 6vw, 2rem);
	}

	p {
		color: var(--ink-soft);
		max-width: 36ch;
	}

	a {
		display: inline-flex;
		align-items: center;
		min-height: 50px;
		padding: 0.7rem 1.5rem;
		border-radius: var(--radius-pill);
		background: var(--grad-primary);
		color: #fff;
		font-weight: 800;
		text-decoration: none;
	}
</style>
