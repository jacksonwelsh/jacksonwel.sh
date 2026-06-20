<script lang="ts">
	import type { SeriesPoint } from '.';

	interface Props {
		series: SeriesPoint[];
		// Once the resolution-date hint is unlocked we label the x-axis end.
		resolutionLabel?: string | null;
		// The latest odds value, shown once the game is over.
		showLatest?: boolean;
	}

	let { series, resolutionLabel = null, showLatest = false }: Props = $props();

	// viewBox geometry
	const W = 320;
	const H = 170;
	const padL = 30;
	const padR = 10;
	const padT = 12;
	const padB = 22;
	const plotW = W - padL - padR;
	const plotH = H - padT - padB;

	const points = $derived(series.length ? series : [{ t: 0, p: 0.5 }]);

	const xy = $derived(
		points.map((pt, i) => {
			const x = padL + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
			const y = padT + (1 - clamp(pt.p)) * plotH;
			return { x, y };
		})
	);

	function clamp(p: number): number {
		return Math.max(0, Math.min(1, p));
	}

	const linePath = $derived(
		xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
	);
	const areaPath = $derived(
		xy.length
			? `${linePath} L${xy[xy.length - 1].x.toFixed(2)} ${(padT + plotH).toFixed(2)} L${xy[0].x.toFixed(2)} ${(padT + plotH).toFixed(2)} Z`
			: ''
	);

	const latest = $derived(points[points.length - 1].p);
	const gridLines = [0, 0.25, 0.5, 0.75, 1];
</script>

<div class="w-full sm:w-[32rem] mx-auto">
	<svg viewBox="0 0 {W} {H}" class="w-full h-auto" role="img" aria-label="Odds over time">
		<defs>
			<linearGradient id="betdle-fill" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="currentColor" stop-opacity="0.28" />
				<stop offset="100%" stop-color="currentColor" stop-opacity="0" />
			</linearGradient>
		</defs>

		<!-- horizontal gridlines + y-axis labels -->
		{#each gridLines as g}
			{@const y = padT + (1 - g) * plotH}
			<line
				x1={padL}
				x2={W - padR}
				y1={y}
				y2={y}
				class="stroke-slate-200 dark:stroke-slate-700"
				stroke-width="0.75"
			/>
			<text
				x={padL - 4}
				y={y + 3}
				text-anchor="end"
				class="fill-slate-400 dark:fill-slate-500"
				font-size="8"
			>
				{g * 100}%
			</text>
		{/each}

		<!-- area + line -->
		<path d={areaPath} fill="url(#betdle-fill)" class="text-teal-500" />
		<path
			d={linePath}
			fill="none"
			class="stroke-teal-500"
			stroke-width="2"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>

		<!-- latest point marker -->
		{#if xy.length}
			<circle cx={xy[xy.length - 1].x} cy={xy[xy.length - 1].y} r="2.5" class="fill-teal-500" />
		{/if}

		<!-- latest value callout, revealed at game over -->
		{#if showLatest && xy.length}
			<text
				x={Math.min(xy[xy.length - 1].x, W - padR - 2)}
				y={Math.max(xy[xy.length - 1].y - 6, padT + 6)}
				text-anchor="end"
				class="fill-teal-600 dark:fill-teal-400 font-mono"
				font-size="9"
				font-weight="700"
			>
				{Math.round(latest * 100)}%
			</text>
		{/if}

		<!-- x-axis baseline -->
		<line
			x1={padL}
			x2={W - padR}
			y1={padT + plotH}
			y2={padT + plotH}
			class="stroke-slate-300 dark:stroke-slate-600"
			stroke-width="1"
		/>

		<!-- x-axis labels: start is always "earlier"; end is hidden until the date hint unlocks -->
		<text
			x={padL}
			y={H - 6}
			text-anchor="start"
			class="fill-slate-400 dark:fill-slate-500"
			font-size="8"
		>
			earlier
		</text>
		<text
			x={W - padR}
			y={H - 6}
			text-anchor="end"
			class="fill-slate-400 dark:fill-slate-500"
			font-size="8"
		>
			{resolutionLabel ?? '???'}
		</text>
	</svg>
</div>
