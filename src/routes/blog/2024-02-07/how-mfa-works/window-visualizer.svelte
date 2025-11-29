<script lang="ts">
	import { run } from 'svelte/legacy';

	import { timestamp, codes } from './store';
	interface Props {
		[key: string]: any
	}

	let { ...props }: Props = $props();

	let progressFill = $state(((300 - ($timestamp % 300)) / 300) * 100);

	run(() => {
		progressFill = ((300 - ($timestamp % 300)) / 300) * 100;
	});
</script>

<div class={`flex flex-wrap gap-4 items-center justify-center py-4 ${props.class}`}>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">expired</div>
		<span class="text-red-800 dark:text-red-300/75">{$codes[0]}</span>
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">previous</div>
		<span class="text-lg">{$codes[1]}</span>
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 font-mono w-full md:w-auto">
		<div class="bg-teal-500 h-2 rounded-md transition-all" style:width={`${progressFill}%`}></div>
		<div class="px-4 sm:px-6 pb-3 pt-1">
			<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">current</div>
			<span class="text-2xl">{$codes[2]}</span>
		</div>
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">next</div>
		<span class="text-lg">{$codes[3]}</span>
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">invalid</div>
		<span class="text-red-800 dark:text-red-300/75">{$codes[4]}</span>
	</div>
</div>
