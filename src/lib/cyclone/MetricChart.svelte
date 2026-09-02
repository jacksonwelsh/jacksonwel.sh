<script lang="ts">
	import { usesMiles } from './format';
	import type { MetricStream } from './types';

	let {
		stream,
		locale,
		hoverPosition,
		onHoverPosition,
		cursorLabel,
		omittedRanges = []
	}: {
		stream: MetricStream;
		locale: string;
		hoverPosition?: number;
		onHoverPosition?: (position: number | undefined) => void;
		cursorLabel?: (position: number) => string;
		omittedRanges?: [number, number][];
	} = $props();

	const colors: Record<string, string> = {
		power: '#34d399',
		heart_rate: '#fb7185',
		cadence: '#60a5fa',
		speed: '#f59e0b',
		elevation: '#a78bfa'
	};

	let color = $derived(colors[stream.metric] ?? '#2dd4bf');
	let title = $derived(stream.metric.replaceAll('_', ' '));
	let displayStream = $derived.by(() => {
		if (stream.metric === 'speed' && stream.unit === 'm/s') {
			const multiplier = usesMiles(locale) ? 2.236936 : 3.6;
			return {
				...stream,
				unit: usesMiles(locale) ? 'mph' : 'km/h',
				samples: stream.samples.map(
					([elapsed, value]) => [elapsed, value * multiplier] as [number, number]
				)
			};
		}
		if (stream.metric === 'elevation' && stream.unit === 'm' && usesMiles(locale)) {
			return {
				...stream,
				unit: 'ft',
				samples: stream.samples.map(
					([distance, value]) => [distance, value * 3.28084] as [number, number]
				)
			};
		}
		return stream;
	});
	const isOmitted = (position: number) =>
		omittedRanges.some(([start, end]) => position > start && position < end);
	const compactPosition = (position: number) =>
		position -
		omittedRanges.reduce(
			(total, [start, end]) => total + Math.max(0, Math.min(position, end) - start),
			0
		);
	const expandPosition = (position: number) => {
		let elapsed = position;
		let omittedDuration = 0;
		for (const [start, end] of omittedRanges) {
			if (position < start - omittedDuration) break;
			elapsed += end - start;
			omittedDuration += end - start;
		}
		return elapsed;
	};

	let visibleSamples = $derived(displayStream.samples.filter(([elapsed]) => !isOmitted(elapsed)));
	let values = $derived(visibleSamples.map((sample) => sample[1]));
	let cumulativeElevationGain = $derived.by(() => {
		let gain = 0;
		for (let index = 1; index < visibleSamples.length; index++) {
			gain += Math.max(visibleSamples[index][1] - visibleSamples[index - 1][1], 0);
		}
		return gain;
	});
	let minimum = $derived(values.length ? Math.min(...values) : 0);
	let maximum = $derived(values.length ? Math.max(...values) : 0);
	let average = $derived(
		values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
	);
	let end = $derived(displayStream.samples.at(-1)?.[0] || 1);
	let visibleEnd = $derived(compactPosition(end) || 1);
	let coordinates = $derived.by(() => {
		const span = Math.max(maximum - minimum, 1);
		return visibleSamples.map(([elapsed, value]) => ({
			x: (compactPosition(elapsed) / visibleEnd) * 100,
			y: 36 - ((value - minimum) / span) * 30,
			elapsed,
			value
		}));
	});
	let linePath = $derived(
		coordinates.map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ')
	);
	let areaPath = $derived(
		linePath ? `${linePath} L ${coordinates.at(-1)?.x} 38 L ${coordinates[0].x} 38 Z` : ''
	);
	let selected = $derived.by(() => {
		if (hoverPosition == null || !coordinates.length || isOmitted(hoverPosition)) return undefined;
		return coordinates.reduce((nearest, point) =>
			Math.abs(point.elapsed - hoverPosition) < Math.abs(nearest.elapsed - hoverPosition)
				? point
				: nearest
		);
	});
	let cursorX = $derived(
		hoverPosition == null
			? undefined
			: Math.min(Math.max((compactPosition(hoverPosition) / visibleEnd) * 100, 0), 100)
	);
	let selectedPosition = $derived(hoverPosition ?? selected?.elapsed);
	let selectedElevationGain = $derived.by(() => {
		if (!selected) return cumulativeElevationGain;
		let gain = 0;
		for (let index = 1; index < visibleSamples.length; index++) {
			if (visibleSamples[index][0] > selected.elapsed) break;
			gain += Math.max(visibleSamples[index][1] - visibleSamples[index - 1][1], 0);
		}
		return gain;
	});
	let showCumulativeElevationGain = $state(false);
	let displayedValue = $derived(
		stream.metric === 'elevation'
			? selected
				? showCumulativeElevationGain
					? selectedElevationGain
					: selected.value
				: cumulativeElevationGain
			: (selected?.value ?? average)
	);
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

	const positionLabel = (position: number) => elapsedLabel(position);
	const selectedLabel = (position: number) => cursorLabel?.(position) ?? positionLabel(position);

	const selectAt = (clientX: number, element: HTMLElement) => {
		if (!coordinates.length) return;
		const bounds = element.getBoundingClientRect();
		const ratio = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
		onHoverPosition?.(expandPosition(ratio * visibleEnd));
	};

	const handlePointer = (event: PointerEvent) =>
		selectAt(event.clientX, event.currentTarget as HTMLElement);

	const toggleElevationGain = () => {
		if (stream.metric === 'elevation' && selected) {
			showCumulativeElevationGain = !showCumulativeElevationGain;
		}
	};

	const handleKey = (event: KeyboardEvent) => {
		if ((event.key === 'Enter' || event.key === ' ') && stream.metric === 'elevation' && selected) {
			event.preventDefault();
			toggleElevationGain();
			return;
		}
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const direction = event.key === 'ArrowRight' ? 1 : -1;
		const currentIndex =
			hoverPosition == null
				? direction > 0
					? -1
					: coordinates.length
				: coordinates.reduce(
					(best, point, index) =>
						Math.abs(point.elapsed - hoverPosition) <
						Math.abs(coordinates[best].elapsed - hoverPosition)
							? index
							: best,
					0
				);
		const nextIndex = Math.min(
			Math.max(currentIndex + direction, 0),
			coordinates.length - 1
		);
		onHoverPosition?.(coordinates[nextIndex].elapsed);
	};
</script>

<figure class="border-t border-slate-200 py-4 dark:border-slate-800">
	<figcaption class="mb-1 flex items-baseline justify-between gap-4">
		<span class="text-sm capitalize text-slate-700 dark:text-slate-200">{title}</span>
		<span class="font-mono text-sm tabular-nums" aria-live="polite" style:color>
			{#if stream.metric === 'elevation' && (!selected || showCumulativeElevationGain)}+{/if}
			{valueLabel(displayedValue)}
			{displayStream.unit}
		</span>
	</figcaption>
	<p class="mb-3 h-4 text-right font-mono text-xs text-slate-500">
		{selected ? selectedLabel(selectedPosition ?? selected.elapsed) : stream.metric === 'elevation' ? 'total gain' : 'average'}
	</p>
	{#if linePath}
		<div
			class="h-32 w-full cursor-crosshair overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
			role="slider"
			tabindex="0"
			aria-label={`${title} sample`}
			aria-valuemin="0"
			aria-valuemax={visibleEnd}
			aria-valuenow={hoverPosition == null ? 0 : compactPosition(hoverPosition)}
			aria-valuetext={`${valueLabel(selected?.value ?? coordinates[0]?.value ?? 0)} ${displayStream.unit} at ${selectedLabel(selectedPosition ?? selected?.elapsed ?? coordinates[0]?.elapsed ?? 0)}`}
			onpointerdown={handlePointer}
			onpointermove={handlePointer}
			onpointerleave={() => onHoverPosition?.(undefined)}
			onclick={toggleElevationGain}
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
						x1={cursorX ?? selected.x}
						y1="3"
						x2={cursorX ?? selected.x}
						y2="38"
						class="stroke-slate-400 dark:stroke-slate-500"
						stroke-width="1"
						vector-effect="non-scaling-stroke"
					/>
					<ellipse
						cx={cursorX ?? selected.x}
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
