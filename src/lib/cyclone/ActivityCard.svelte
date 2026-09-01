<script lang="ts">
	import { activityName, date, stats, textExcerpt } from './format';
	import type { ActivitySummary } from './types';

	let { activity }: { activity: ActivitySummary } = $props();
	let cover = $derived(activity.photos.find((photo) => photo.cover)?.feed_url);
	let image = $derived(cover ?? activity.route_snapshot_url);
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
			<img
				src={image}
				alt=""
				class="aspect-[16/10] w-full bg-slate-100 object-cover dark:bg-slate-900 md:order-2"
			/>
		{/if}
		<div class="max-w-2xl md:order-1">
			<div>
				<p class="mb-2 font-mono text-xs text-slate-500 dark:text-slate-400">
					{date(activity.local_date)} · {activityName[activity.type]}{activity.virtual
						? ' · virtual'
						: ''}
				</p>
				<h2
					class="text-2xl font-semibold leading-tight text-slate-950 decoration-2 underline-offset-4 group-hover:underline dark:text-slate-50 md:text-3xl"
				>
					{activity.title}
				</h2>
			</div>
			{#if stats(activity.metrics).length}
				<dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
					{#each stats(activity.metrics).slice(0, 3) as stat}
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
