<script lang="ts">
	import MetricChart from '$lib/cyclone/MetricChart.svelte';
	import PhotoGallery from '$lib/cyclone/PhotoGallery.svelte';
	import RouteMap from '$lib/cyclone/RouteMap.svelte';
	import WorkoutStructure from '$lib/cyclone/WorkoutStructure.svelte';
	import { activityName, date, detailStats } from '$lib/cyclone/format';
	import { rideEmbedDescription } from '$lib/cyclone/embed';
	import type { MetricStream, RoutePoint } from '$lib/cyclone/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let activity = $derived(data.activity);
	let readyPhotos = $derived(
		activity.photos.filter((photo) => photo.status === 'ready' && photo.feed_url)
	);
	let activityStats = $derived(detailStats(activity.metrics, data.locale, activity.type));
	const metricOrder = ['power', 'heart_rate', 'speed', 'cadence'];
	let streams = $derived(
		[...data.streams].sort(
			(a, b) =>
				(metricOrder.indexOf(a.metric) < 0 ? metricOrder.length : metricOrder.indexOf(a.metric)) -
				(metricOrder.indexOf(b.metric) < 0 ? metricOrder.length : metricOrder.indexOf(b.metric))
		)
	);
	let elevationStream = $derived(
		activity.type === 'outdoor_ride' && !streams.some((stream) => stream.metric === 'elevation')
			? elevationProfile(activity.route_segments)
			: undefined
	);
	let embedDescription = $derived(rideEmbedDescription(activity, data.locale));
	let embedImageURL = $derived(activity.share_image_url);

	function pointDistance(a: RoutePoint, b: RoutePoint) {
		const radians = Math.PI / 180;
		const latitudeDelta = (b.latitude - a.latitude) * radians;
		const longitudeDelta = (b.longitude - a.longitude) * radians;
		const latitudeA = a.latitude * radians;
		const latitudeB = b.latitude * radians;
		const haversine =
			Math.sin(latitudeDelta / 2) ** 2 +
			Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
		return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
	}

	function elevationProfile(segments: RoutePoint[][]): MetricStream | undefined {
		let distance = 0;
		const samples: [number, number][] = [];
		for (const segment of segments) {
			let previous: RoutePoint | undefined;
			for (const point of segment) {
				if (previous) distance += pointDistance(previous, point);
				if (point.altitude_meters != null) samples.push([distance, point.altitude_meters]);
				previous = point;
			}
		}
		return samples.length > 1 ? { metric: 'elevation', unit: 'm', samples } : undefined;
	}
</script>

<svelte:head>
	<title>{activity.title} · Ride · Jackson Welsh</title>
	<meta name="description" content={embedDescription} />
	<link rel="canonical" href={activity.canonical_url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Jackson Welsh" />
	<meta property="og:title" content={`${activity.title} · Ride`} />
	<meta property="og:description" content={embedDescription} />
	<meta property="og:url" content={activity.canonical_url} />
	{#if embedImageURL}
		<meta property="og:image" content={embedImageURL} />
		<meta property="og:image:type" content="image/jpeg" />
		<meta property="og:image:alt" content={`Ride summary for ${activity.title}`} />
	{/if}
	{#if activity.route_snapshot_url}
		<meta property="og:image" content={activity.route_snapshot_url} />
		<meta property="og:image:alt" content={`Route map for ${activity.title}`} />
	{/if}
	{#each readyPhotos.slice(0, 3) as photo}
		<meta property="og:image" content={photo.feed_url} />
		<meta property="og:image:type" content="image/jpeg" />
		<meta property="og:image:alt" content={`Ride photo for ${activity.title}`} />
	{/each}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${activity.title} · Ride`} />
	<meta name="twitter:description" content={embedDescription} />
	{#if embedImageURL}<meta name="twitter:image" content={embedImageURL} />{/if}
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
			{#if activityStats.length}
				<dl
					class="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-slate-200 py-5 sm:grid-cols-4 dark:border-slate-800"
				>
					{#each activityStats as stat}<div>
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

		{#if streams.length || elevationStream}
			<section class="mb-14" aria-labelledby="charts-heading">
				<h2 id="charts-heading" class="mb-4 font-mono text-xl">
					{activity.type === 'outdoor_ride' ? 'ride data' : 'effort'}
				</h2>
				<div class="grid gap-x-8 gap-y-6 md:grid-cols-2">
					{#each streams as stream (stream.metric)}<MetricChart
							{stream}
							locale={data.locale}
						/>{/each}
					{#if elevationStream}
						<MetricChart stream={elevationStream} locale={data.locale} xAxis="distance" />
					{/if}
				</div>
			</section>
		{/if}

		<WorkoutStructure intervals={activity.intervals} zones={activity.zones} />
	</article>
</main>
