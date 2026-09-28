<script lang="ts">
	import Icon, { type IconName } from '../Icon.svelte';

	interface Props {
		label: string;
		value: string | number;
		icon: IconName;
		tone?: 'violet' | 'pink' | 'blue' | 'green' | 'amber';
	}

	let { label, value, icon, tone = 'violet' }: Props = $props();
</script>

<div class="stat {tone}">
	<span class="icon"><Icon name={icon} size={20} /></span>
	<div>
		<p class="value">{value}</p>
		<p class="label">{label}</p>
	</div>
</div>

<style>
	.stat {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 1rem;
		background: #fff;
		border: 1px solid #e6e4ec;
		border-radius: 12px;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		border-radius: 10px;
	}

	.value {
		font-size: 1.45rem;
		font-weight: 800;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}

	.label {
		font-size: 0.82rem;
		color: #6c6879;
		font-weight: 600;
	}

	.violet .icon {
		background: #f0ecfb;
		color: #6f55c2;
	}
	.pink .icon {
		background: #fdecf3;
		color: #b8467a;
	}
	.blue .icon {
		background: #e8f3fc;
		color: #2f6fa8;
	}
	.green .icon {
		background: #e6f6ee;
		color: #2f8a5f;
	}
	.amber .icon {
		background: #fdf4dd;
		color: #9a6b0c;
	}
</style>
