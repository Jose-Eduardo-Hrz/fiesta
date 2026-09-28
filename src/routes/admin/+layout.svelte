<script lang="ts">
	import { page } from '$app/state';
	import { EVENT } from '$lib/config';
	import Icon from '$lib/components/Icon.svelte';
	import type { IconName } from '$lib/components/Icon.svelte';

	let { data, children } = $props();

	const nav: { href: string; label: string; icon: IconName }[] = [
		{ href: '/admin', label: 'Resumen', icon: 'grid' },
		{ href: '/admin/archivos', label: 'Todos los archivos', icon: 'photo' }
	];

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		return href === '/admin' ? path === '/admin' || path.startsWith('/admin/mesa') : path.startsWith(href);
	}
</script>

<div class="admin">
	<header class="topbar">
		<div class="topbar-inner">
			<a class="brand" href="/admin">
				<span class="logo" aria-hidden="true">🧸</span>
				<span class="brand-text">
					<strong>Panel del anfitrión</strong>
					<small>{EVENT.title}</small>
				</span>
			</a>

			<nav aria-label="Secciones del panel">
				{#each nav as item (item.href)}
					<a href={item.href} class:active={isActive(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>
						<Icon name={item.icon} size={18} />
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<form method="POST" action="/admin/logout" class="logout">
				<span class="user"><Icon name="user" size={16} /> {data.admin?.username}</span>
				<button type="submit" title="Cerrar sesión">
					<Icon name="logout" size={18} />
					<span>Salir</span>
				</button>
			</form>
		</div>
	</header>

	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.admin {
		--a-bg: #f6f6f9;
		--a-surface: #ffffff;
		--a-border: #e6e4ec;
		--a-text: #24212e;
		--a-muted: #6c6879;
		--a-accent: #6f55c2;
		--a-accent-soft: #f0ecfb;

		min-height: 100dvh;
		background: var(--a-bg);
		color: var(--a-text);
		font-size: 0.97rem;
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgb(255 255 255 / 0.92);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--a-border);
	}

	.topbar-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0.6rem 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: inherit;
		margin-right: auto;
	}

	.logo {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: var(--a-accent-soft);
		font-size: 1.3rem;
	}

	.brand-text {
		display: grid;
		line-height: 1.2;
	}

	.brand-text strong {
		font-size: 0.98rem;
	}

	.brand-text small {
		color: var(--a-muted);
		font-size: 0.78rem;
	}

	nav {
		display: flex;
		gap: 0.25rem;
		order: 3;
		width: 100%;
		overflow-x: auto;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.8rem;
		border-radius: 8px;
		color: var(--a-muted);
		text-decoration: none;
		font-weight: 700;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	nav a:hover {
		background: var(--a-bg);
		color: var(--a-text);
	}

	nav a.active {
		background: var(--a-accent-soft);
		color: var(--a-accent);
	}

	.logout {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.user {
		display: none;
		align-items: center;
		gap: 0.3rem;
		color: var(--a-muted);
		font-size: 0.85rem;
	}

	.logout button {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 38px;
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--a-border);
		border-radius: 8px;
		background: var(--a-surface);
		font-weight: 700;
		font-size: 0.88rem;
		cursor: pointer;
		color: var(--a-text);
	}

	.logout button:hover {
		border-color: #d4d0de;
		background: var(--a-bg);
	}

	.content {
		max-width: 1280px;
		margin: 0 auto;
		padding: 1.25rem 1rem 3rem;
	}

	@media (min-width: 820px) {
		nav {
			order: 0;
			width: auto;
		}

		.user {
			display: inline-flex;
		}

		.content {
			padding: 2rem 1.5rem 4rem;
		}
	}
</style>
