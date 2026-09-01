<script lang="ts">
	import { activityName, date, stats, textExcerpt } from './format';
	import type { ActivitySummary } from './types';

	let { activity }: { activity: ActivitySummary } = $props();
	let cover = $derived(activity.photos.find((photo) => photo.cover)?.feed_url);
	let image = $derived(cover ?? activity.route_snapshot_url);
</script>

<article
	class="group overflow-hidden rounded-2xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60"
>
	<a href={`/ride/${activity.id}`} aria-label={`View ${activity.title}`}>
		{#if image}
			<img
				src={image}
				alt=""
				class="aspect-[16/9] w-full bg-slate-100 object-cover transition duration-300 group-hover:scale-[1.01] dark:bg-slate-900"
			/>
		{:else}
			<div
				class="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-teal-100 to-blue-100 text-4xl text-teal-800 dark:from-teal-950 dark:to-blue-950 dark:text-teal-300"
				aria-hidden="true"
			>
				↗
			</div>
		{/if}
		<div class="space-y-4 p-5 md:p-6">
			<div>
				<p class="mb-2 text-xs uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
					{date(activity.local_date)} · {activityName[activity.type]}{activity.virtual
						? ' · virtual'
						: ''}
				</p>
				<h2 class="text-2xl font-mono-medium leading-tight text-slate-950 dark:text-slate-50">
					{activity.title}
				</h2>
			</div>
			{#if stats(activity.metrics).length}
				<dl class="flex flex-wrap gap-x-6 gap-y-2">
					{#each stats(activity.metrics).slice(0, 3) as stat}
						<div>
							<dt class="text-xs text-slate-500 dark:text-slate-400">{stat.label}</dt>
							<dd class="text-sm text-slate-900 dark:text-slate-100">{stat.value}</dd>
						</div>
					{/each}
				</dl>
			{/if}
			{#if activity.description_html}
				<p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
					{textExcerpt(activity.description_html)}
				</p>
			{/if}
		</div>
	</a>
</article>
