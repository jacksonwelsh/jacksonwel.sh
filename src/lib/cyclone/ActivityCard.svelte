<script lang="ts">
	import { activityName, date, stats, textExcerpt } from './format';
	import type { ActivitySummary } from './types';
	import { cardImage } from './cardImage';

	let {
		activity,
		locale,
		priority = false
	}: { activity: ActivitySummary; locale: string; priority?: boolean } = $props();
	let cover = $derived(activity.photos.find((photo) => photo.cover));
	let imageSource = $derived(
		cardImage(cover, activity.route_snapshot_dark_url ?? activity.route_snapshot_url)
	);
	let image = $derived(imageSource.src);
	let visibleStats = $derived(stats(activity.metrics, locale).slice(0, 3));
</script>

<article class="group border-t border-slate-200 py-8 dark:border-slate-800 md:py-10">
	<a
		href={`/ride/${activity.id}`}
		aria-label={`View ${activity.title}`}
		class:grid={image}
		class:gap-8={image}
		class:md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)]={image}
		class:items-start={image}
	>
		{#if image}
			<picture class="md:order-2">
				{#if !cover?.thumbnail_url && !cover?.feed_url && activity.route_snapshot_url}
					<source media="(prefers-color-scheme: light)" srcset={activity.route_snapshot_url} />
				{/if}
				<img
					src={image}
					srcset={imageSource.srcset}
					sizes="(min-width: 928px) 356px, (min-width: 768px) calc(41.1765vw - 26.353px), calc(100vw - 32px)"
					alt=""
					loading={priority ? 'eager' : 'lazy'}
					fetchpriority={priority ? 'high' : 'auto'}
					decoding="async"
					class="aspect-[16/10] w-full bg-slate-100 object-cover dark:bg-slate-900"
				/>
			</picture>
		{/if}
		<div class="max-w-2xl md:order-1">
			<div>
				<p class="mb-2 font-mono text-xs text-slate-500 dark:text-slate-400">
					{date(activity.local_date, locale)} · {activityName[activity.type]}{activity.virtual
						? ' · virtual'
						: ''}
				</p>
				<h2
					class="text-2xl font-semibold leading-tight text-slate-950 decoration-2 underline-offset-4 group-hover:underline dark:text-slate-50 md:text-3xl"
				>
					{activity.title}
				</h2>
			</div>
			{#if visibleStats.length}
				<dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
					{#each visibleStats as stat}
						<div class="flex items-baseline gap-2">
							<dt class="text-xs text-slate-500 dark:text-slate-400">{stat.label}</dt>
							<dd class="font-mono text-sm text-slate-900 dark:text-slate-100">{stat.value}</dd>
						</div>
					{/each}
				</dl>
			{/if}
			{#if activity.description_html}
				<p class="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
					{textExcerpt(activity.description_html)}
				</p>
			{/if}
		</div>
	</a>
</article>
