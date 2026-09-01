<script lang="ts">
	import type { MetricStream } from './types';

	let { stream }: { stream: MetricStream } = $props();
	let values = $derived(stream.samples.map((sample) => sample[1]));
	let minimum = $derived(values.length ? Math.min(...values) : 0);
	let maximum = $derived(values.length ? Math.max(...values) : 0);
	let average = $derived(
		values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
	);
	let points = $derived.by(() => {
		if (stream.samples.length < 2) return '';
		const end = stream.samples.at(-1)?.[0] || 1;
		const span = Math.max(maximum - minimum, 1);
		return stream.samples
			.map(([elapsed, value]) => `${(elapsed / end) * 100},${36 - ((value - minimum) / span) * 32}`)
			.join(' ');
	});
	let title = $derived(stream.metric.replaceAll('_', ' '));
</script>

<figure class="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
	<figcaption class="mb-3 flex items-baseline justify-between">
		<span class="text-sm capitalize text-slate-700 dark:text-slate-200">{title}</span>
		<span class="text-xs text-slate-500">avg {Math.round(average)} {stream.unit}</span>
	</figcaption>
	{#if points}
		<svg
			viewBox="0 0 100 40"
			class="h-28 w-full overflow-visible"
			role="img"
			aria-label={`${title}: average ${Math.round(average)}, minimum ${Math.round(minimum)}, maximum ${Math.round(maximum)} ${stream.unit}`}
		>
			<line
				x1="0"
				y1="36"
				x2="100"
				y2="36"
				class="stroke-slate-200 dark:stroke-slate-800"
				vector-effect="non-scaling-stroke"
			/>
			<polyline
				{points}
				fill="none"
				class="stroke-teal-600 dark:stroke-teal-300"
				stroke-width="1.5"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
	{:else}
		<p class="py-8 text-center text-sm text-slate-500">Not enough data to draw this chart.</p>
	{/if}
</figure>
