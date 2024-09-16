<script lang="ts">
	import { HintState } from '.';

	export let state: HintState = HintState.DISABLED;

	const stateStyles = {
		[HintState.DISABLED]: 'dark:bg-slate-800 bg-slate-100 cursor-not-allowed',
		[HintState.UNKNOWN]: 'bg-white dark:bg-slate-900 cursor-text',
		[HintState.VERY_HIGH]: 'bg-red-500',
		[HintState.HIGH]: 'bg-orange-500',
		[HintState.CORRECT]: 'bg-green-500',
		[HintState.LOW]: 'bg-blue-500',
		[HintState.VERY_LOW]: 'bg-indigo-500'
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
		'border group-focus-within:border-2 group-focus-within:border-l-0 border-l-0 border-gray-200 dark:border-gray-700 group-focus-within:border-teal-500 rounded-r-md w-24 font-mono font-mono-bold flex items-center justify-center text-xl h-full',
		stateStyles[state]
	].join(' ')}
>
	{stateContents[state]}
</div>
