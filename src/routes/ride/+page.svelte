<script lang="ts">
	import ActivityCard from '$lib/cyclone/ActivityCard.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Ride · Jackson Welsh</title>
	<meta name="description" content="Cycling, running, walking, and hiking activity feed." />
</svelte:head>

<main
	class="min-h-screen bg-slate-50 px-4 py-10 font-mono text-slate-950 dark:bg-slate-950 dark:text-slate-50 md:py-16"
>
	<div class="mx-auto max-w-6xl">
		<nav class="mb-14 flex items-center justify-between text-sm">
			<a href="/" class="font-mono-medium">jackson welsh</a>
			<span class="text-teal-700 dark:text-teal-300">/ride</span>
		</nav>
		<header class="mb-10 max-w-2xl">
			<p class="mb-3 text-xs uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
				activity log
			</p>
			<h1 class="text-4xl font-mono-medium tracking-tight md:text-6xl">the long way around.</h1>
			<p class="mt-5 leading-relaxed text-slate-600 dark:text-slate-300">
				Rides first, with the occasional run, walk, or hike.
			</p>
		</header>

		{#if data.unavailable}
			<section
				class="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
			>
				<h2 class="font-mono-medium">The activity feed is temporarily unavailable.</h2>
				<p class="mt-2 text-sm opacity-80">Please try again in a little while.</p>
			</section>
		{:else if data.page.activities.length === 0}
			<p class="rounded-2xl border border-slate-200 p-8 text-slate-500 dark:border-slate-800">
				No published activities yet.
			</p>
		{:else}
			<section class="grid gap-6 md:grid-cols-2" aria-label="Activities">
				{#each data.page.activities as activity (activity.id)}<ActivityCard {activity} />{/each}
			</section>
			{#if data.page.next_cursor}
				<div class="mt-10 text-center">
					<a
						class="inline-block rounded-full border border-teal-600 px-5 py-3 text-sm text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950"
						href={`?cursor=${encodeURIComponent(data.page.next_cursor)}`}>Older activities →</a
					>
				</div>
			{/if}
		{/if}
	</div>
</main>
