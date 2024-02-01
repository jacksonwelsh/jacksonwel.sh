<script lang="ts">
	export const codes = new Array(5);

	import { DT, hmac } from './mfaUtils';
	import { secret, timestamp, counter } from './store';

	let progressFill = ((300 - ($timestamp % 300)) / 300) * 100;
	let counterInt = parseInt($counter);

	$: counterInt = parseInt($counter);
	$: {
		progressFill = ((300 - ($timestamp % 300)) / 300) * 100;
		console.log(progressFill);
	}
</script>

<div class={`flex flex-wrap gap-4 items-center justify-center py-4 ${$$props.class}`}>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">invalid</div>
		{#await hmac($secret, (counterInt - 2).toString()) then encoded}
			{#if encoded}
				<span class="text-red-800 dark:text-red-300/75"
					>{DT(encoded).toString().padStart(6, '0')}</span
				>
			{/if}
		{/await}
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">expired</div>
		{#await hmac($secret, (counterInt - 1).toString()) then encoded}
			{#if encoded}
				<span class="text-lg">{DT(encoded).toString().padStart(6, '0')}</span>
			{/if}
		{/await}
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 font-mono w-full md:w-auto">
		<div class="bg-teal-500 h-2 rounded-md transition-all" style:width={`${progressFill}%`} />
		<div class="px-4 sm:px-6 pb-3 pt-1">
			<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">current</div>
			{#await hmac($secret, $counter) then encoded}
				{#if encoded}
					<span class="text-2xl">{DT(encoded).toString().padStart(6, '0')}</span>
				{/if}
			{/await}
		</div>
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">next</div>
		{#await hmac($secret, (counterInt + 1).toString()) then encoded}
			{#if encoded}
				<span class="text-lg">{DT(encoded).toString().padStart(6, '0')}</span>
			{/if}
		{/await}
	</div>
	<div class="rounded-md bg-white dark:bg-gray-900 px-4 py-2 font-mono w-full md:w-auto">
		<div class="text-gray-700 dark:text-gray-400 text-sm mb-1">invalid</div>
		{#await hmac($secret, (counterInt + 2).toString()) then encoded}
			{#if encoded}
				<span class="text-red-800 dark:text-red-300/75"
					>{DT(encoded).toString().padStart(6, '0')}</span
				>
			{/if}
		{/await}
	</div>
</div>
