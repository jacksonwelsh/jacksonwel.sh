<script lang="ts">
	import { usesMiles } from './format';
	import type { MetricStream } from './types';

	let { stream, locale }: { stream: MetricStream; locale: string } = $props();
	let selectedIndex = $state<number | undefined>();

	const colors: Record<string, string> = {
		power: '#34d399',
		heart_rate: '#fb7185',
		cadence: '#60a5fa',
		speed: '#f59e0b'
	};

	let color = $derived(colors[stream.metric] ?? '#2dd4bf');
	let title = $derived(stream.metric.replaceAll('_', ' '));
	let displayStream = $derived.by(() => {
		if (stream.metric !== 'speed' || stream.unit !== 'm/s') return stream;
		const multiplier = usesMiles(locale) ? 2.236936 : 3.6;
		return {
			...stream,
			unit: usesMiles(locale) ? 'mph' : 'km/h',
			samples: stream.samples.map(
				([elapsed, value]) => [elapsed, value * multiplier] as [number, number]
			)
		};
	});
	let values = $derived(displayStream.samples.map((sample) => sample[1]));
	let minimum = $derived(values.length ? Math.min(...values) : 0);
	let maximum = $derived(values.length ? Math.max(...values) : 0);
	let average = $derived(
		values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
	);
	let end = $derived(displayStream.samples.at(-1)?.[0] || 1);
	let coordinates = $derived.by(() => {
		const span = Math.max(maximum - minimum, 1);
		return displayStream.samples.map(([elapsed, value]) => ({
			x: (elapsed / end) * 100,
			y: 36 - ((value - minimum) / span) * 30,
			elapsed,
			value
		}));
	});
	let linePath = $derived(
		coordinates.map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ')
	);
	let areaPath = $derived(linePath ? `${linePath} L 100 38 L 0 38 Z` : '');
	let selected = $derived(selectedIndex == null ? undefined : coordinates[selectedIndex]);
	let gradientID = $derived(`metric-${stream.metric.replaceAll(/[^a-z0-9]/gi, '-')}`);

	const valueLabel = (value: number) =>
		new Intl.NumberFormat(locale, {
			maximumFractionDigits: displayStream.unit === 'mph' ? 1 : 0
		}).format(value);

	const elapsedLabel = (milliseconds: number) => {
		const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return hours
			? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
			: `${minutes}:${String(seconds).padStart(2, '0')}`;
	};

	const selectAt = (clientX: number, element: HTMLElement) => {
		if (!coordinates.length) return;
		const bounds = element.getBoundingClientRect();
		const ratio = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
		const elapsed = ratio * end;
		selectedIndex = coordinates.reduce(
			(best, point, index) =>
				Math.abs(point.elapsed - elapsed) < Math.abs(coordinates[best].elapsed - elapsed)
					? index
					: best,
			0
		);
	};

	const handlePointer = (event: PointerEvent) =>
		selectAt(event.clientX, event.currentTarget as HTMLElement);

	const handleKey = (event: KeyboardEvent) => {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const direction = event.key === 'ArrowRight' ? 1 : -1;
		selectedIndex = Math.min(
			Math.max((selectedIndex ?? (direction > 0 ? -1 : coordinates.length)) + direction, 0),
			coordinates.length - 1
		);
	};
</script>

<figure class="border-t border-slate-200 py-4 dark:border-slate-800">
	<figcaption class="mb-1 flex items-baseline justify-between gap-4">
		<span class="text-sm capitalize text-slate-700 dark:text-slate-200">{title}</span>
		<span class="font-mono text-sm tabular-nums" aria-live="polite" style:color>
			{valueLabel(selected?.value ?? average)}
			{displayStream.unit}
		</span>
	</figcaption>
	<p class="mb-3 h-4 text-right font-mono text-xs text-slate-500">
		{selected ? elapsedLabel(selected.elapsed) : 'average'}
	</p>
	{#if linePath}
		<div
			class="h-32 w-full cursor-crosshair overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
			role="slider"
			tabindex="0"
			aria-label={`${title} sample`}
			aria-valuemin="0"
			aria-valuemax={Math.max(coordinates.length - 1, 0)}
			aria-valuenow={selectedIndex ?? 0}
			aria-valuetext={`${valueLabel(selected?.value ?? coordinates[0]?.value ?? 0)} ${displayStream.unit} at ${elapsedLabel(selected?.elapsed ?? coordinates[0]?.elapsed ?? 0)}`}
			onpointerdown={handlePointer}
			onpointermove={handlePointer}
			onpointerleave={() => (selectedIndex = undefined)}
			onkeydown={handleKey}
		>
			<svg
				viewBox="0 0 100 40"
				preserveAspectRatio="none"
				class="h-full w-full overflow-visible"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id={gradientID} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color={color} stop-opacity="0.28" />
						<stop offset="100%" stop-color={color} stop-opacity="0" />
					</linearGradient>
				</defs>
				<path d={areaPath} fill={`url(#${gradientID})`} />
				<path
					d={linePath}
					fill="none"
					stroke={color}
					stroke-width="1.5"
					stroke-linejoin="round"
					stroke-linecap="round"
					vector-effect="non-scaling-stroke"
				/>
				{#if selected}
					<line
						x1={selected.x}
						y1="3"
						x2={selected.x}
						y2="38"
						class="stroke-slate-400 dark:stroke-slate-500"
						stroke-width="1"
						vector-effect="non-scaling-stroke"
					/>
					<ellipse
						cx={selected.x}
						cy={selected.y}
						rx="1.8"
						ry="2.4"
						fill={color}
						stroke="currentColor"
						stroke-width="1"
					/>
				{/if}
			</svg>
		</div>
	{:else}
		<p class="py-8 text-center text-sm text-slate-500">Not enough data to draw this chart.</p>
	{/if}
</figure>
