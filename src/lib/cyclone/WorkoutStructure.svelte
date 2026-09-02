<script lang="ts">
	import type { ActivityInterval, ActivityZones } from './types';

	let { intervals, zones }: { intervals: ActivityInterval[]; zones: ActivityZones } = $props();

	type ZoneDefinition = { name: string; color: string };
	type ZoneRow = ZoneDefinition & { zone: number; seconds: number; percent: number };

	const powerZones: Record<number, ZoneDefinition> = {
		1: { name: 'Active Recovery', color: '#8283F3' },
		2: { name: 'Endurance', color: '#5FB8F9' },
		3: { name: 'Tempo', color: '#64D7A9' },
		4: { name: 'Threshold', color: '#B1D946' },
		5: { name: 'VO₂ Max', color: '#F6C849' },
		6: { name: 'Anaerobic', color: '#F09048' },
		7: { name: 'Neuromuscular', color: '#DA555B' }
	};
	const heartRateZones: Record<number, ZoneDefinition> = {
		1: { name: 'Recovery', color: '#5FB8F9' },
		2: { name: 'Aerobic', color: '#64D7A9' },
		3: { name: 'Tempo', color: '#F6C849' },
		4: { name: 'Threshold', color: '#F09048' },
		5: { name: 'Max', color: '#DA555B' }
	};

	let selectedInterval = $state(0);
	let structuredIntervals = $derived(
		intervals.filter((interval) => Number(interval.duration_seconds) > 0)
	);
	let totalIntervalSeconds = $derived(
		structuredIntervals.reduce((total, interval) => total + Number(interval.duration_seconds), 0)
	);
	let currentInterval = $derived(structuredIntervals[selectedInterval]);
	let powerRows = $derived(zoneRows(zones.power_seconds, powerZones));
	let heartRateRows = $derived(zoneRows(zones.heart_rate_seconds, heartRateZones));

	function zoneRows(
		values: Record<string, number> | undefined,
		definitions: Record<number, ZoneDefinition>
	): ZoneRow[] {
		if (!values) return [];
		const total = Object.values(values).reduce((sum, value) => sum + Number(value || 0), 0);
		if (!total) return [];
		return Object.entries(values)
			.map(([key, value]) => {
				const zone = Number(key);
				return {
					zone,
					seconds: Number(value || 0),
					percent: (Number(value || 0) / total) * 100,
					...(definitions[zone] ?? { name: `Zone ${zone}`, color: '#94a3b8' })
				};
			})
			.filter((row) => row.seconds > 0)
			.sort((a, b) => a.zone - b.zone);
	}

	function duration(seconds: number | undefined) {
		const value = Math.round(Number(seconds || 0));
		const hours = Math.floor(value / 3600);
		const minutes = Math.floor((value % 3600) / 60);
		const remainder = value % 60;
		if (hours) return `${hours}h ${minutes}m`;
		if (minutes) return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
		return `${remainder}s`;
	}

	function intervalLabel(interval: ActivityInterval, index: number) {
		const zone = Number(interval.power_zone);
		const definition = powerZones[zone];
		const effort = definition ? `Z${zone} ${definition.name}` : 'unstructured';
		return `Interval ${index + 1}, ${effort}, ${duration(interval.duration_seconds)}`;
	}
</script>

{#if structuredIntervals.length || powerRows.length || heartRateRows.length}
	<section class="mb-14" aria-labelledby="workout-structure-heading">
		<h2 id="workout-structure-heading" class="mb-5 font-mono text-xl">workout structure</h2>

		{#if structuredIntervals.length}
			<div class="mb-10">
				<div
					class="flex h-2 w-full gap-px overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900"
					aria-label="Interval progression"
				>
					{#each structuredIntervals as interval, index}
						{@const zone = Number(interval.power_zone)}
						<button
							type="button"
							class="h-full min-w-1 opacity-90 outline-none transition-[opacity,filter] hover:opacity-100 focus-visible:brightness-75 dark:focus-visible:brightness-125"
							class:opacity-40={selectedInterval !== index}
							style:flex-grow={Number(interval.duration_seconds)}
							style:flex-basis={`${(Number(interval.duration_seconds) / totalIntervalSeconds) * 100}%`}
							style:background-color={powerZones[zone]?.color ?? '#cbd5e1'}
							aria-label={intervalLabel(interval, index)}
							onpointerenter={() => (selectedInterval = index)}
							onfocus={() => (selectedInterval = index)}
							onclick={() => (selectedInterval = index)}
						></button>
					{/each}
				</div>
				{#if currentInterval}
					{@const currentZone = Number(currentInterval.power_zone)}
					<p class="mt-3 text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
						<span class="font-mono text-slate-400"
							>{selectedInterval + 1}/{structuredIntervals.length}</span
						>
						<span class="mx-2 text-slate-300 dark:text-slate-700">·</span>
						{#if powerZones[currentZone]}
							<span style:color={powerZones[currentZone].color}>Z{currentZone}</span>
							{powerZones[currentZone].name}
						{:else}
							Warmup or recovery
						{/if}
						<span class="mx-2 text-slate-300 dark:text-slate-700">·</span>
						<span class="font-mono">{duration(currentInterval.duration_seconds)}</span>
					</p>
				{/if}
			</div>
		{/if}

		<div class="grid gap-x-12 gap-y-10 md:grid-cols-2">
			{#if powerRows.length}
				<div>
					<h3 class="mb-4 text-sm font-medium">Power zones</h3>
					<ul class="space-y-4">
						{#each powerRows as row}
							<li>
								<div class="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
									<span
										><span class="font-mono" style:color={row.color}>Z{row.zone}</span> · {row.name}</span
									>
									<span
										class="whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400"
									>
										{duration(row.seconds)} · {Math.round(row.percent)}%
									</span>
								</div>
								<div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
									<div
										class="h-full rounded-full"
										style:width={`${row.percent}%`}
										style:background-color={row.color}
									></div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if heartRateRows.length}
				<div>
					<h3 class="mb-4 text-sm font-medium">Heart rate zones</h3>
					<ul class="space-y-4">
						{#each heartRateRows as row}
							<li>
								<div class="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
									<span
										><span class="font-mono" style:color={row.color}>Z{row.zone}</span> · {row.name}</span
									>
									<span
										class="whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400"
									>
										{duration(row.seconds)} · {Math.round(row.percent)}%
									</span>
								</div>
								<div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
									<div
										class="h-full rounded-full"
										style:width={`${row.percent}%`}
										style:background-color={row.color}
									></div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</section>
{/if}
