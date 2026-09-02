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
	class="min-h-screen bg-white px-4 pb-16 font-sans text-slate-950 dark:bg-black dark:text-slate-50"
>
	<div class="mx-auto max-w-4xl">
		<nav class="mb-20 pt-3 font-mono text-sm text-slate-400">
			<a href="/" class="text-blue-500 hover:underline dark:text-blue-400">~</a>/ride
		</nav>
		<header class="mb-12">
			<h1 class="text-5xl font-bold tracking-tight md:text-6xl">rides</h1>
		</header>

		{#if data.unavailable}
			<section class="border-t border-amber-500 py-6 text-amber-900 dark:text-amber-200">
				<h2 class="font-semibold">The activity feed is temporarily unavailable.</h2>
				<p class="mt-1 text-sm opacity-80">Try again in a little while.</p>
			</section>
		{:else if data.page.activities.length === 0}
			<p class="border-t border-slate-200 py-8 text-slate-500 dark:border-slate-800">
				Nothing here yet.
			</p>
		{:else}
			<section aria-label="Activities">
				{#each data.page.activities as activity (activity.id)}<ActivityCard
						{activity}
						locale={data.locale}
					/>{/each}
			</section>
			{#if data.page.next_cursor}
				<div class="mt-8">
					<a
						class="text-sm text-blue-600 underline underline-offset-4 dark:text-blue-400"
						href={`?cursor=${encodeURIComponent(data.page.next_cursor)}`}>Older activities →</a
					>
				</div>
			{/if}
		{/if}
	</div>
</main>
