<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { EVENT } from '$lib/config';
	import { loadGuest, saveGuest } from '$lib/client/guest';
	import type { GuestInput } from '$lib/validation';
	import Header from '$lib/components/Header.svelte';
	import EventPhoto from '$lib/components/EventPhoto.svelte';
	import Card from '$lib/components/Card.svelte';
	import GuestForm from '$lib/components/GuestForm.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let savedGuest = $state<GuestInput | null>(null);
	let ready = $state(false);

	onMount(() => {
		savedGuest = loadGuest();
		ready = true;
	});

	function handleSubmit(guest: GuestInput) {
		saveGuest(guest);
		goto('/upload');
	}

	const steps = [
		{ icon: 'user', text: 'Escribe tu nombre y mesa' },
		{ icon: 'photo', text: 'Elige tus fotos y videos' },
		{ icon: 'heart', text: '¡Compártelos con nosotros!' }
	] as const;
</script>

<svelte:head>
	<title>{EVENT.title}</title>
	<meta name="description" content="Comparte tus fotos y videos del Baby Shower de {EVENT.babyName}." />
</svelte:head>

<div class="stack">
	<Header />

	<div class="photo">
		<EventPhoto />
	</div>

	<Card>
		<div class="card-head">
			<h2>Comparte tus recuerdos</h2>
			<p>Ayúdanos a guardar cada sonrisa de este día. Solo toma un minuto.</p>
		</div>

		<ol class="steps">
			{#each steps as step, i (i)}
				<li>
					<span class="step-icon"><Icon name={step.icon} size={20} /></span>
					<span>{step.text}</span>
				</li>
			{/each}
		</ol>

		{#if ready}
			<GuestForm initial={savedGuest} onsubmit={handleSubmit} />
		{:else}
			<div class="form-skeleton" aria-hidden="true"></div>
		{/if}
	</Card>
</div>

<style>
	.stack {
		display: grid;
		gap: 2rem;
	}

	.photo {
		padding: 0 0.5rem;
		animation: fade-in 1s 0.5s var(--ease-out) both;
	}

	.card-head {
		text-align: center;
		display: grid;
		gap: 0.4rem;
		margin-bottom: 1.2rem;
	}

	h2 {
		font-size: 1.65rem;
		color: var(--ink);
	}

	.card-head p {
		color: var(--ink-soft);
		font-size: 0.98rem;
	}

	.steps {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		counter-reset: step;
	}

	.steps li {
		display: grid;
		justify-items: center;
		gap: 0.4rem;
		text-align: center;
		font-size: 0.8rem;
		font-weight: 700;
		line-height: 1.25;
		color: var(--ink-soft);
	}

	.step-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		color: var(--berry);
		background: linear-gradient(135deg, var(--blush), var(--lavender));
	}

	.steps li:nth-child(2) .step-icon {
		color: var(--violet);
		background: linear-gradient(135deg, var(--lavender), var(--sky));
	}

	.steps li:nth-child(3) .step-icon {
		color: var(--azul-deep);
		background: linear-gradient(135deg, var(--sky), var(--mint));
	}

	.form-skeleton {
		height: 260px;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
