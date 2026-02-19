<script lang="ts">
	import Divider from '$lib/divider.svelte';
</script>

<svelte:head>
	<title>ZoneBuddy | Jackson Welsh</title>
	<meta
		name="description"
		content="ZoneBuddy — a companion app for Power Zone training on any stationary bike."
	/>
</svelte:head>

<article class="container mx-auto sm:px-4 lg:max-w-5xl">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/zonebuddy
	</div>

	<main class="mx-auto px-2 md:px-0 my-16">
		<h1 class="text-6xl font-mono-bold font-mono mb-2">ZoneBuddy</h1>
		<p class="text-lg font-mono-light font-mono text-teal-800 dark:text-teal-200 mb-12">
			Power Zone training for any stationary bike.
		</p>

		<section class="mb-16">
			<h2 class="text-2xl font-mono font-mono-semibold mb-4">What is it?</h2>
			<p class="text-lg leading-relaxed max-w-prose">
				ZoneBuddy lets you build custom Power Zone workouts and ride them on your Peloton bike in
				Just Ride mode. Set your zones, arrange your intervals, and let the app guide you through
				each one with audio cues and a live timer.
			</p>
		</section>

		<!-- Screenshot showcase -->
		<section class="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
			<div
				class="aspect-[9/19.5] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700"
			>
				<span class="text-slate-400 dark:text-slate-500 text-sm font-mono">screenshot</span>
			</div>
			<div
				class="aspect-[9/19.5] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700"
			>
				<span class="text-slate-400 dark:text-slate-500 text-sm font-mono">screenshot</span>
			</div>
		</section>

		<section class="mb-16">
			<h2 class="text-2xl font-mono font-mono-semibold mb-4">Features</h2>
			<ul class="list-dash list-inside ml-6 -indent-3 space-y-2 text-lg max-w-prose">
				<li>Build workouts with custom intervals and power zones</li>
				<li>Audio cues announce zone changes so you can stay focused on the ride</li>
				<li>Syncs across your devices with iCloud</li>
				<li>Share workouts with friends</li>
				<li>Designed for iOS 26 with Liquid Glass</li>
			</ul>
		</section>

		<footer class="text-sm text-slate-500 dark:text-slate-400 font-mono-light font-mono">
			<a href="/zonebuddy/privacy" class="text-blue-400 hover:underline">Privacy Policy</a>
		</footer>
	</main>
</article>
