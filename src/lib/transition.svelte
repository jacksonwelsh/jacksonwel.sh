<script>
	import { onDestroy, onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { navigating } from '$app/stores';

	const progress = tweened(0, {
		duration: 3500,
		easing: cubicOut
	});
	const unsubscribe = navigating.subscribe((state) => {
		if (state == null) {
			progress.set(1, { duration: 1000 });
		}
	});
	onMount(() => {
		progress.set(0.7);
	});
	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="progress-bar top-0 left-0 right-0 fixed h-1">
	<div
		class="progress-sliver bg-linear-to-r dark:from-teal-900/50 dark:via-teal-800/50 dark:to-teal-300/50 from-teal-300/50 via-teal-400/50 to-teal-600/50 h-full"
		style={`--width: ${$progress * 100}%`}
	/>
</div>

<style>
	.progress-sliver {
		width: var(--width);
	}
</style>
