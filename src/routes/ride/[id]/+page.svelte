<script lang="ts">
	import MetricChart from '$lib/cyclone/MetricChart.svelte';
	import RouteMap from '$lib/cyclone/RouteMap.svelte';
	import { activityName, date, stats } from '$lib/cyclone/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let activity = $derived(data.activity);
	let readyPhotos = $derived(
		activity.photos.filter((photo) => photo.status === 'ready' && photo.feed_url)
	);
	let zoneEntries = $derived(Object.entries(activity.zones ?? {}));
</script>

<svelte:head>
	<title>{activity.title} · Ride · Jackson Welsh</title>
	<meta
		name="description"
		content={`${activityName[activity.type]} on ${date(activity.local_date)}`}
	/>
	<link rel="canonical" href={activity.canonical_url} />
</svelte:head>

<main
	class="min-h-screen bg-slate-50 px-4 py-10 font-mono text-slate-950 dark:bg-slate-950 dark:text-slate-50 md:py-16"
>
	<article class="mx-auto max-w-5xl">
		<nav class="mb-12 flex items-center justify-between text-sm">
			<a href="/" class="font-mono-medium">jackson welsh</a><a
				href="/ride"
				class="text-teal-700 dark:text-teal-300">← all activities</a
			>
		</nav>
		<header class="mb-10 max-w-3xl">
			<p class="mb-3 text-xs uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
				{date(activity.local_date)} · {activityName[activity.type]}{activity.virtual
					? ' · virtual'
					: ''}
			</p>
			<h1 class="text-4xl font-mono-medium leading-tight tracking-tight md:text-6xl">
				{activity.title}
			</h1>
			{#if stats(activity.metrics).length}
				<dl
					class="mt-8 grid grid-cols-2 gap-5 border-y border-slate-200 py-6 sm:grid-cols-4 dark:border-slate-800"
				>
					{#each stats(activity.metrics) as stat}<div>
							<dt class="text-xs text-slate-500 dark:text-slate-400">{stat.label}</dt>
							<dd class="mt-1 text-xl">{stat.value}</dd>
						</div>{/each}
				</dl>
			{/if}
		</header>

		{#if readyPhotos.length}
			<section class="mb-12 grid gap-3 sm:grid-cols-2" aria-label="Activity photos">
				{#each readyPhotos as photo, index (photo.id)}
					<a
						href={photo.feed_url}
						target="_blank"
						rel="noreferrer"
						class={index === 0 && readyPhotos.length % 2 === 1 ? 'sm:col-span-2' : ''}
					>
						<img
							src={photo.feed_url}
							alt={`Activity photo ${index + 1} of ${readyPhotos.length}`}
							class="max-h-[42rem] w-full rounded-2xl bg-slate-100 object-cover dark:bg-slate-900"
							loading={index ? 'lazy' : 'eager'}
						/>
					</a>
				{/each}
			</section>
		{/if}

		{#if activity.route_segments.length}
			<section class="mb-12" aria-labelledby="route-heading">
				<h2 id="route-heading" class="mb-4 text-2xl font-mono-medium">route</h2>
				<RouteMap
					segments={activity.route_segments}
					token={data.mapToken}
					fallback={activity.route_snapshot_url}
				/>
				<noscript
					>{#if activity.route_snapshot_url}<img
							src={activity.route_snapshot_url}
							alt="Map of the approved public route"
							class="mt-4 w-full rounded-2xl"
						/>{/if}</noscript
				>
			</section>
		{/if}

		{#if activity.description_html}
			<section
				class="raw-text prose prose-slate mb-12 max-w-3xl dark:prose-invert"
				aria-label="Activity notes"
			>
				{@html activity.description_html}
			</section>
		{/if}

		{#if data.streams.length}
			<section class="mb-12" aria-labelledby="charts-heading">
				<h2 id="charts-heading" class="mb-5 text-2xl font-mono-medium">effort</h2>
				<div class="grid gap-4 md:grid-cols-2">
					{#each data.streams as stream (stream.metric)}<MetricChart {stream} />{/each}
				</div>
			</section>
		{/if}

		{#if zoneEntries.length || activity.intervals.length}
			<section class="mb-12 grid gap-8 md:grid-cols-2" aria-label="Workout structure">
				{#if zoneEntries.length}
					<div>
						<h2 class="mb-4 text-2xl font-mono-medium">zones</h2>
						<dl
							class="space-y-2 rounded-xl border border-slate-200 p-5 text-sm dark:border-slate-800"
						>
							{#each zoneEntries as [name, value]}<div class="flex justify-between gap-4">
									<dt>{name.replaceAll('_', ' ')}</dt>
									<dd class="text-slate-500 dark:text-slate-400">
										{typeof value === 'object' ? JSON.stringify(value) : String(value)}
									</dd>
								</div>{/each}
						</dl>
					</div>
				{/if}
				{#if activity.intervals.length}
					<div>
						<h2 class="mb-4 text-2xl font-mono-medium">intervals</h2>
						<ol
							class="space-y-2 rounded-xl border border-slate-200 p-5 text-sm dark:border-slate-800"
						>
							{#each activity.intervals as interval, index}<li>
									<span class="mr-3 text-slate-400">{index + 1}.</span>{Object.entries(interval)
										.map(([key, value]) => `${key.replaceAll('_', ' ')}: ${String(value)}`)
										.join(' · ')}
								</li>{/each}
						</ol>
					</div>
				{/if}
			</section>
		{/if}
	</article>
</main>
