<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { HintState } from '.';

	interface Props {
		state?: HintState;
	}

	let { state = HintState.DISABLED }: Props = $props();

	const stateStyles = {
		[HintState.DISABLED]: 'dark:bg-slate-800 bg-slate-100 cursor-not-allowed dark:border-gray-700',
		[HintState.UNKNOWN]: 'bg-white dark:bg-slate-900 cursor-text dark:border-gray-700',
		[HintState.VERY_HIGH]:
			'bg-red-500 dark:bg-red-900/50 dark:border-red-500 dark:text-red-500 dark:border-l cursor-default',
		[HintState.HIGH]:
			'bg-orange-500 dark:bg-orange-900/50 dark:border-orange-500 dark:text-orange-500 dark:border-l cursor-default',
		[HintState.CORRECT]:
			'bg-green-500 dark:bg-green-900/50 dark:border-green-500 dark:text-green-500 dark:border-l cursor-default',
		[HintState.LOW]:
			'bg-blue-500 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-500 dark:border-l cursor-default',
		[HintState.VERY_LOW]:
			'bg-indigo-500 dark:bg-indigo-900/50 dark:border-indigo-500 dark:text-indigo-500 dark:border-l cursor-default'
	};

	const stateContents = {
		[HintState.DISABLED]: '',
		[HintState.UNKNOWN]: '',
		[HintState.VERY_HIGH]: '↓↓',
		[HintState.HIGH]: '↓',
		[HintState.CORRECT]: '✓',
		[HintState.LOW]: '↑',
		[HintState.VERY_LOW]: '↑↑'
	};

	const stateTooltips = {
		[HintState.DISABLED]: '',
		[HintState.UNKNOWN]: '',
		[HintState.VERY_HIGH]: 'This is much higher than the actual population!',
		[HintState.HIGH]: 'This is a little higher than the actual population.',
		[HintState.CORRECT]: 'Correct! Nice work.',
		[HintState.LOW]: 'This is a little lower than the actual population.',
		[HintState.VERY_LOW]: 'This is much lower than the actual population!'
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onmousedown={bubble('mousedown')}
	class={[
		'border group-focus-within:border-2 group-focus-within:border-l-0 border-l-0 border-gray-200 group-focus-within:border-teal-500 rounded-r-md w-24 font-mono font-mono-bold flex items-center justify-center text-xl h-full',
		stateStyles[state]
	].join(' ')}
	title={stateTooltips[state]}
>
	{stateContents[state]}
</div>
