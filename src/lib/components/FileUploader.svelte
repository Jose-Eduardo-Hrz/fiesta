<!--
  Selector de archivos: botón grande para el celular (abre la galería con
  selección múltiple) y zona para arrastrar y soltar en computadora.
-->
<script lang="ts">
	import { FILE_INPUT_ACCEPT, UPLOAD_LIMITS } from '$lib/config';
	import { formatBytes } from '$lib/utils/format';
	import Icon from './Icon.svelte';

	interface Props {
		onfiles: (files: File[]) => void;
		disabled?: boolean;
		hasFiles?: boolean;
	}

	let { onfiles, disabled = false, hasFiles = false }: Props = $props();

	let input: HTMLInputElement | undefined = $state();
	let dragging = $state(false);

	function handleChange() {
		if (!input?.files) return;
		onfiles(Array.from(input.files));
		input.value = ''; // permite volver a elegir los mismos archivos
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragging = false;
		if (disabled || !event.dataTransfer) return;
		onfiles(Array.from(event.dataTransfer.files));
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (!disabled) dragging = true;
	}
</script>

<div
	class="dropzone"
	class:dragging
	class:compact={hasFiles}
	class:disabled
	role="presentation"
	ondragover={handleDragOver}
	ondragleave={() => (dragging = false)}
	ondrop={handleDrop}
>
	<input
		bind:this={input}
		id="file-input"
		type="file"
		accept={FILE_INPUT_ACCEPT}
		multiple
		{disabled}
		onchange={handleChange}
		class="visually-hidden"
	/>

	<label for="file-input" class="picker" aria-disabled={disabled}>
		<span class="bubble" aria-hidden="true">
			<Icon name={hasFiles ? 'plus' : 'photo'} size={hasFiles ? 26 : 34} stroke={2} />
		</span>
		<span class="text">
			<strong>{hasFiles ? 'Agregar más fotos o videos' : 'Elegir fotos y videos'}</strong>
			{#if !hasFiles}
				<span class="sub">Puedes seleccionar varios a la vez desde tu galería</span>
			{/if}
		</span>
	</label>

	{#if !hasFiles}
		<p class="limits">
			Hasta {UPLOAD_LIMITS.maxFilesPerSubmission} archivos · fotos de hasta {formatBytes(UPLOAD_LIMITS.maxImageBytes)} ·
			videos de hasta {formatBytes(UPLOAD_LIMITS.maxVideoBytes)}
		</p>
	{/if}
</div>

<style>
	.dropzone {
		border: 2.5px dashed var(--pink);
		border-radius: var(--radius);
		background:
			radial-gradient(circle at 20% 10%, rgb(253 228 238 / 0.9), transparent 60%),
			radial-gradient(circle at 90% 90%, rgb(214 236 251 / 0.9), transparent 55%),
			#fff;
		padding: 1.6rem 1rem 1.2rem;
		text-align: center;
		transition:
			border-color 0.2s,
			transform 0.2s var(--ease-spring),
			background-color 0.2s;
	}

	.dropzone.compact {
		padding: 0.6rem;
		border-width: 2px;
	}

	.dragging {
		border-color: var(--lilac);
		transform: scale(1.01);
		background-color: #faf7ff;
	}

	.disabled {
		opacity: 0.55;
		pointer-events: none;
	}

	.picker {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
		cursor: pointer;
		border-radius: var(--radius-sm);
		padding: 0.5rem;
		-webkit-user-select: none;
		user-select: none;
		touch-action: manipulation;
	}

	.compact .picker {
		flex-direction: row;
		justify-content: center;
		gap: 0.7rem;
		min-height: 52px;
	}

	.bubble {
		display: grid;
		place-items: center;
		width: 76px;
		height: 76px;
		border-radius: 50%;
		color: #fff;
		background: var(--grad-primary);
		box-shadow: 0 12px 24px -10px rgb(212 87 143 / 0.6);
		animation: pulse 2.6s ease-in-out infinite;
	}

	.compact .bubble {
		width: 40px;
		height: 40px;
		animation: none;
	}

	.picker:active .bubble {
		transform: scale(0.94);
	}

	.text {
		display: grid;
		gap: 0.2rem;
	}

	.text strong {
		font-size: 1.15rem;
		font-weight: 800;
		color: var(--berry);
	}

	.compact .text strong {
		font-size: 1.02rem;
	}

	.sub {
		color: var(--ink-soft);
		font-size: 0.95rem;
	}

	.limits {
		margin-top: 0.9rem;
		font-size: 0.82rem;
		color: var(--ink-muted);
	}

	.picker:focus-within,
	#file-input:focus-visible + .picker {
		outline: 3px solid var(--lilac);
		outline-offset: 2px;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 12px 24px -10px rgb(212 87 143 / 0.6);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 16px 30px -10px rgb(143 106 216 / 0.55);
		}
	}
</style>
