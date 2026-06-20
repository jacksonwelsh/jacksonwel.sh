<script lang="ts">
	import { REVEAL_ORDER, hintValue, type Puzzle } from '.';

	interface Props {
		puzzle: Puzzle;
		// How many hints are unlocked (== number of wrong guesses so far).
		revealed: number;
	}

	let { puzzle, revealed }: Props = $props();
</script>

<div class="w-full sm:w-[32rem] mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
	{#each REVEAL_ORDER as hint, i}
		{@const isOpen = i < revealed}
		<div
			class="rounded-md border px-3 py-2 text-left text-sm transition-colors {isOpen
				? 'border-teal-500/40 bg-teal-50 dark:bg-teal-900/30'
				: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40'}"
		>
			<div class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
				{hint.label}
			</div>
			<div
				class="font-mono font-mono-semibold {isOpen ? '' : 'text-slate-300 dark:text-slate-600'}"
			>
				{isOpen ? hintValue(puzzle, hint.key) : '???'}
			</div>
		</div>
	{/each}
</div>
