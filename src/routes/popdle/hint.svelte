<script lang="ts">
	import { HintState } from '.';

	export let state: HintState = HintState.DISABLED;

	const stateStyles = {
		[HintState.DISABLED]: 'dark:bg-slate-800 bg-slate-100 cursor-not-allowed dark:border-gray-700',
		[HintState.UNKNOWN]: 'bg-white dark:bg-slate-900 cursor-text dark:border-gray-700',
		[HintState.VERY_HIGH]:
			'bg-red-500 dark:bg-red-900/50 dark:border-red-500 dark:text-red-500 dark:border-l',
		[HintState.HIGH]:
			'bg-orange-500 dark:bg-orange-900/50 dark:border-orange-500 dark:text-orange-500 dark:border-l',
		[HintState.CORRECT]:
			'bg-green-500 dark:bg-green-900/50 dark:border-green-500 dark:text-green-500 dark:border-l',
		[HintState.LOW]:
			'bg-blue-500 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-500 dark:border-l',
		[HintState.VERY_LOW]:
			'bg-indigo-500 dark:bg-indigo-900/50 dark:border-indigo-500 dark:text-indigo-500 dark:border-l'
	};

	const stateContents = {
		[HintState.DISABLED]: '',
		[HintState.UNKNOWN]: '',
		[HintState.VERY_HIGH]: '>>',
		[HintState.HIGH]: '>',
		[HintState.CORRECT]: '=',
		[HintState.LOW]: '<',
		[HintState.VERY_LOW]: '<<'
	};
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:mousedown
	class={[
		'border group-focus-within:border-2 group-focus-within:border-l-0 border-l-0 border-gray-200 group-focus-within:border-teal-500 rounded-r-md w-24 font-mono font-mono-bold flex items-center justify-center text-xl h-full',
		stateStyles[state]
	].join(' ')}
>
	{stateContents[state]}
</div>
