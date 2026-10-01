<!-- "@" reinicia el layout: el login no usa el marco del panel. -->
<script lang="ts">
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';
	import { EVENT } from '$lib/config';
	import Bear from '$lib/components/decor/Bear.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Acceso anfitrión · {EVENT.title}</title>
</svelte:head>

<div class="login-page">
	<div class="panel">
		<div class="brand">
			<Bear fur="#b9a5ef" furLight="#efe9ff" symbol="star" size={64} animate="none" />
			<div>
				<p class="kicker">Panel del anfitrión</p>
				<h1>{EVENT.title}</h1>
			</div>
		</div>

		{#if !data.configured}
			<div class="notice warn">
				<Icon name="alert" size={18} />
				<p>
					El panel aún no está configurado. Define <code>ADMIN_USERNAME</code> y <code>ADMIN_PASSWORD</code> en el archivo
					<code>.env</code> y reinicia el servidor.
				</p>
			</div>
		{:else if data.expired && !form?.message}
			<div class="notice">
				<Icon name="lock" size={18} />
				<p>Inicia sesión para continuar.</p>
			</div>
		{/if}

		{#if form?.message}
			<div class="notice error" role="alert">
				<Icon name="alert" size={18} />
				<p>{form.message}</p>
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<label>
				<span>Usuario</span>
				<input name="username" autocomplete="username" required value={form?.username ?? ''} autocapitalize="none" spellcheck="false" />
			</label>
			<label>
				<span>Contraseña</span>
				<input name="password" type="password" autocomplete="current-password" required />
			</label>
			<button type="submit" disabled={submitting || !data.configured}>
				<Icon name="lock" size={18} />
				{submitting ? 'Entrando…' : 'Entrar'}
			</button>
		</form>

		<a class="back" href="{base}/">← Volver a la página de invitados</a>
	</div>
</div>

<style>
	.login-page {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 1.25rem;
		background:
			radial-gradient(circle at 0% 0%, #f5f0ff, transparent 50%),
			radial-gradient(circle at 100% 100%, #eaf5fd, transparent 50%),
			#f7f7fa;
	}

	.panel {
		width: min(100%, 400px);
		display: grid;
		gap: 1.2rem;
		padding: 2rem 1.5rem;
		background: #fff;
		border-radius: 18px;
		border: 1px solid #e7e5ee;
		box-shadow: 0 20px 50px -25px rgb(40 30 80 / 0.3);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}

	.kicker {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-weight: 800;
		color: var(--violet);
	}

	h1 {
		font-family: var(--font-body);
		font-size: 1.15rem;
		font-weight: 800;
	}

	form {
		display: grid;
		gap: 0.9rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.9rem;
		font-weight: 700;
	}

	input {
		min-height: 48px;
		padding: 0.6rem 0.9rem;
		border-radius: 10px;
		border: 1.5px solid #dcd8e6;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: var(--violet);
		box-shadow: 0 0 0 3px rgb(111 85 194 / 0.18);
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 50px;
		border: 0;
		border-radius: 10px;
		background: var(--violet);
		color: #fff;
		font-weight: 800;
		font-size: 1rem;
		cursor: pointer;
		margin-top: 0.3rem;
	}

	button:hover:not(:disabled) {
		background: #5d45ad;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.notice {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		padding: 0.75rem 0.9rem;
		border-radius: 10px;
		font-size: 0.9rem;
		background: #f1f5fb;
		color: #2c4a6e;
	}

	.notice.error {
		background: var(--danger-bg);
		color: #7d2238;
	}

	.notice.warn {
		background: var(--warning-bg);
		color: #6f5311;
	}

	code {
		font-size: 0.85em;
		background: rgb(0 0 0 / 0.06);
		padding: 0.05em 0.3em;
		border-radius: 4px;
	}

	.back {
		text-align: center;
		font-size: 0.88rem;
		color: var(--ink-soft);
	}
</style>
