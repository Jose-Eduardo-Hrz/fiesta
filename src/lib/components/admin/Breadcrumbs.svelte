<script lang="ts">
	interface Crumb {
		label: string;
		href?: string;
	}
	let { items }: { items: Crumb[] } = $props();
</script>

<nav aria-label="Ruta de navegación">
	<ol>
		{#each items as item, i (i)}
			<li>
				{#if item.href && i < items.length - 1}
					<a href={item.href}>{item.label}</a>
				{:else}
					<span aria-current="page">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	ol {
		list-style: none;
		margin: 0 0 0.75rem;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		font-size: 0.88rem;
		color: #6c6879;
	}

	li:not(:last-child)::after {
		content: '/';
		margin-left: 0.3rem;
		color: #b5b1c0;
	}

	a {
		color: #6f55c2;
		text-decoration: none;
		font-weight: 600;
	}

	a:hover {
		text-decoration: underline;
	}

	span {
		font-weight: 600;
		color: #24212e;
	}
</style>
