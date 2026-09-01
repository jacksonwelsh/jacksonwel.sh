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
	class="min-h-screen bg-white px-4 pb-20 font-sans text-slate-950 dark:bg-black dark:text-slate-50"
>
	<article class="mx-auto max-w-4xl">
		<nav class="mb-20 pt-3 font-mono text-sm text-slate-400">
			<a href="/" class="text-blue-500 hover:underline dark:text-blue-400">~</a>/<a
				href="/ride"
				class="hover:underline">ride</a
			>
		</nav>
		<header class="mb-12 max-w-3xl">
			<p class="mb-3 font-mono text-sm text-slate-500 dark:text-slate-400">
				{date(activity.local_date)} · {activityName[activity.type]}{activity.virtual
					? ' · virtual'
					: ''}
			</p>
			<h1 class="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
				{activity.title}
			</h1>
			{#if stats(activity.metrics).length}
				<dl
					class="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-slate-200 py-5 sm:grid-cols-4 dark:border-slate-800"
				>
					{#each stats(activity.metrics) as stat}<div>
							<dt class="text-xs text-slate-500 dark:text-slate-400">{stat.label}</dt>
							<dd class="mt-1 font-mono text-lg">{stat.value}</dd>
						</div>{/each}
				</dl>
			{/if}
		</header>

		{#if activity.description_html}
			<section
				class="raw-text prose prose-lg prose-slate mb-14 max-w-3xl font-sans dark:prose-invert"
				aria-label="Activity notes"
			>
				{@html activity.description_html}
			</section>
		{/if}

		{#if readyPhotos.length}
			<section class="mb-14 grid gap-2 sm:grid-cols-2" aria-label="Activity photos">
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
							class="max-h-[42rem] w-full bg-slate-100 object-cover dark:bg-slate-900"
							loading={index ? 'lazy' : 'eager'}
						/>
					</a>
				{/each}
			</section>
		{/if}

		{#if activity.route_segments.length}
			<section class="mb-14" aria-labelledby="route-heading">
				<h2 id="route-heading" class="mb-4 font-mono text-xl">route</h2>
				<RouteMap
					segments={activity.route_segments}
					token={data.mapToken}
					fallback={activity.route_snapshot_url}
				/>
				<noscript
					>{#if activity.route_snapshot_url}<img
							src={activity.route_snapshot_url}
							alt="Map of the approved public route"
							class="mt-4 w-full"
						/>{/if}</noscript
				>
			</section>
		{/if}

		{#if data.streams.length}
			<section class="mb-14" aria-labelledby="charts-heading">
				<h2 id="charts-heading" class="mb-4 font-mono text-xl">effort</h2>
				<div class="grid gap-x-8 gap-y-6 md:grid-cols-2">
					{#each data.streams as stream (stream.metric)}<MetricChart {stream} />{/each}
				</div>
			</section>
		{/if}

		{#if zoneEntries.length || activity.intervals.length}
			<section class="mb-14 grid gap-10 md:grid-cols-2" aria-label="Workout structure">
				{#if zoneEntries.length}
					<div>
						<h2 class="mb-4 font-mono text-xl">zones</h2>
						<dl class="border-t border-slate-200 text-sm dark:border-slate-800">
							{#each zoneEntries as [name, value]}<div
									class="flex justify-between gap-4 border-b border-slate-200 py-3 dark:border-slate-800"
								>
									<dt>{name.replaceAll('_', ' ')}</dt>
									<dd class="font-mono text-slate-500 dark:text-slate-400">
										{typeof value === 'object' ? JSON.stringify(value) : String(value)}
									</dd>
								</div>{/each}
						</dl>
					</div>
				{/if}
				{#if activity.intervals.length}
					<div>
						<h2 class="mb-4 font-mono text-xl">intervals</h2>
						<ol class="border-t border-slate-200 text-sm dark:border-slate-800">
							{#each activity.intervals as interval, index}<li
									class="border-b border-slate-200 py-3 dark:border-slate-800"
								>
									<span class="mr-3 font-mono text-slate-400">{index + 1}.</span>{Object.entries(
										interval
									)
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
