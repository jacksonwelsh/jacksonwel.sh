<script lang="ts">
	import MetricChart from '$lib/cyclone/MetricChart.svelte';
	import PhotoGallery from '$lib/cyclone/PhotoGallery.svelte';
	import RouteMap from '$lib/cyclone/RouteMap.svelte';
	import WorkoutStructure from '$lib/cyclone/WorkoutStructure.svelte';
	import { activityName, date, stats } from '$lib/cyclone/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let activity = $derived(data.activity);
	let readyPhotos = $derived(
		activity.photos.filter((photo) => photo.status === 'ready' && photo.feed_url)
	);
</script>

<svelte:head>
	<title>{activity.title} · Ride · Jackson Welsh</title>
	<meta
		name="description"
		content={`${activityName[activity.type]} on ${date(activity.local_date, data.locale)}`}
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
				{date(activity.local_date, data.locale)} · {activityName[activity.type]}{activity.virtual
					? ' · virtual'
					: ''}
			</p>
			<h1 class="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
				{activity.title}
			</h1>
			{#if stats(activity.metrics, data.locale).length}
				<dl
					class="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-slate-200 py-5 sm:grid-cols-4 dark:border-slate-800"
				>
					{#each stats(activity.metrics, data.locale) as stat}<div>
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
			<PhotoGallery photos={readyPhotos} />
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
					{#each data.streams as stream (stream.metric)}<MetricChart
							{stream}
							locale={data.locale}
						/>{/each}
				</div>
			</section>
		{/if}

		<WorkoutStructure intervals={activity.intervals} zones={activity.zones} />
	</article>
</main>
