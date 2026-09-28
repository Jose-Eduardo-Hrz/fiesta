<script lang="ts" module>
	const PATHS = {
		photo: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 11 4.5-5 3.5 4 2.5-3L20 16M15.5 9.5a1.5 1.5 0 1 0 0-.01',
		video: 'M4 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm12 4 5-3v10l-5-3',
		upload: 'M12 16V4m0 0L7 9m5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
		download: 'M12 4v12m0 0-5-5m5 5 5-5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
		close: 'M6 6l12 12M18 6 6 18',
		check: 'M5 12.5 10 17 19 7',
		alert: 'M12 8v5m0 3.5v.01M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
		refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
		heart: 'M12 20s-7.5-4.6-9-9.3C2 7.4 4.3 4.5 7.4 4.5c1.9 0 3.5 1.1 4.6 2.6 1.1-1.5 2.7-2.6 4.6-2.6 3.1 0 5.4 2.9 4.4 6.2-1.5 4.7-9 9.3-9 9.3Z',
		folder: 'M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z',
		user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
		users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0-1-5.8M18 20h3a5 5 0 0 0-5-5',
		table: 'M4 9h16M6 9v10m12-10v10M3 5h18v4H3z',
		logout: 'M15 17l5-5-5-5m5 5H9m4-8H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8',
		play: 'M8 5.5v13l11-6.5-11-6.5Z',
		back: 'M15 18l-6-6 6-6',
		next: 'M9 18l6-6-6-6',
		grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
		database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
		lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm2 0V8a4 4 0 1 1 8 0v3',
		edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
		plus: 'M12 5v14M5 12h14'
	} as const;

	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		size?: number;
		stroke?: number;
		label?: string;
	}

	let { name, size = 22, stroke = 2, label }: Props = $props();
	const filled = $derived(name === 'play' || name === 'heart');
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={filled ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	style="flex-shrink: 0"
>
	<path d={PATHS[name]} />
</svg>
