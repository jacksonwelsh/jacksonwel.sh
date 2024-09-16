<script lang="ts">
	import Button from '$lib/button.svelte';
	import {
		type DailyState,
		type HintState,
		POPDLE_DAILY_STATE_LS,
		POPDLE_SCORE_LS,
		getScore
	} from '.';
	import GuessInput from './guess-input.svelte';
	import Share from './share.svelte';
	import popdleState from '../../stores/popdle';
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageServerData;
	const { puzzle } = data;
	$popdleState.population = puzzle.pop;

	let guessIndex = 0;
	let hasWon = false;
	let gameOver = false;

	const guesses = new Array(6).fill('');
	const hintStates: HintState[] = new Array(6).fill('UNKNOWN');
	const inputComponents: GuessInput[] = new Array(6);

	onMount(() => loadDailyState());

	const saveResults = () => {
		const currentResults = window.localStorage.getItem(POPDLE_SCORE_LS);

		let newResults: Record<number, number> = {};
		if (currentResults) {
			newResults = JSON.parse(currentResults);
		}

		const score = getScore(hintStates);
		console.log({ score, hintStates });
		newResults[puzzle.index] = score;

		window.localStorage.setItem(POPDLE_SCORE_LS, JSON.stringify(newResults));
	};

	const saveDailyState = () => {
		const state: DailyState = {
			puzzleIndex: puzzle.index,
			guesses,
			gameOver,
			hasWon
		};

		window.localStorage.setItem(POPDLE_DAILY_STATE_LS, JSON.stringify(state));
	};

	const loadDailyState = () => {
		const stateStr = window.localStorage.getItem(POPDLE_DAILY_STATE_LS);
		if (!stateStr) {
			return;
		}

		const state: DailyState = JSON.parse(stateStr);
		if (state.puzzleIndex !== puzzle.index) {
			// Clear state if it's stale
			saveDailyState();
			return;
		}

		gameOver = state.gameOver;
		hasWon = state.hasWon;

		for (let guessIdx in state.guesses) {
			const stateGuess = state.guesses[guessIdx];
			if (stateGuess === '') {
				break;
			}

			guesses[guessIdx] = state.guesses[guessIdx];
			++guessIndex;
		}
	};

	const handleSubmit = () => {
		const minBound = $popdleState.population * 0.95;
		const maxBound = $popdleState.population * 1.05;

		const currentGuess = guesses[guessIndex];

		if (!currentGuess?.match(/^[0-9]+$/)) {
			return;
		}

		const asInt = parseInt(currentGuess);

		if (asInt >= minBound && asInt <= maxBound) {
			hasWon = true;
			gameOver = true;
			setTimeout(() => saveResults());
			saveDailyState();
			return;
		}
		++guessIndex;

		if (guessIndex >= 6) {
			gameOver = true;
			setTimeout(() => saveResults());
			saveDailyState();
			return;
		}

		inputComponents[guessIndex].focusInput();
	};
</script>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/popdle
	</div>
	<div id="wrapper" class="flex items-center justify-center m-2 h-screen">
		<main class="flex flex-wrap text-center items-center justify-center">
			<div id="header" class="flex flex-col items-center my-4">
				<h1 class="relative text-3xl sm:text-5xl font-mono font-mono-bold text-teal-500 mb-2">
					<span>Popdle</span>
					<div
						class="absolute -top-3 -right-12 h-6 flex items-center font-sans font-medium rounded-full px-2 py-0.5 border border-teal-500 text-white dark:text-teal-500 bg-teal-500 dark:bg-teal-900/50 text-sm"
					>
						beta
					</div>
				</h1>
				<p class="text-gray-600 dark:text-gray-400 italic">Guess the population of the city!</p>
			</div>

			<form on:submit|preventDefault={() => handleSubmit()} id="game" class="w-full">
				<h2 class="text-2xl sm:text-3xl font-mono font-mono-semibold">
					{puzzle.city}, {puzzle.state}
				</h2>

				{#if hasWon}
					You got it! 🎉<br />
				{/if}
				{#if gameOver}
					{#if !hasWon}
						Better luck next time :/<br />
					{/if}
					{puzzle.city}'s population is {Intl.NumberFormat().format($popdleState.population)}.
				{/if}

				{#each Array(6) as _, i}
					<GuessInput
						bind:this={inputComponents[i]}
						disabled={hasWon || guessIndex !== i}
						bind:value={guesses[i]}
						bind:hintState={hintStates[i]}
					/>
				{/each}

				{#if !gameOver}
					<Button
						on:click={() => handleSubmit()}
						type="submit"
						disabled={hasWon}
						variant="primary"
						size="xl"
						class="w-full sm:w-[32rem] rounded-md"
					>
						Guess
					</Button>
				{:else}
					<Share results={hintStates} />
				{/if}
			</form>
		</main>
	</div>
</div>
<div
	class="bg-slate-200 dark:bg-slate-900/75 dark:text-slate-300 flex items-center justify-center text-sm flex-wrap"
>
	<div class="container mx-auto p-2">
		<p class="w-full text-center my-6">
			This site uses <a
				class="font-bold underline"
				target="_blank"
				href="https://www.census.gov/data/tables/time-series/demo/popest/2020s-total-cities-and-towns.html"
				>public US Census data</a
			> for population estimates:
		</p>
		<p class="font-mono font-mono-thin">
			Annual Estimates of the Resident Population for Incorporated Places of 20,000 or More, Ranked
			by July 1, 2023 Population: April 1, 2020 to July 1, 2023 (SUB-IP-EST2023-ANNRNK)<br />
			Source: U.S. Census Bureau, Population Division<br />
			Release Date: May 2024
		</p>
		<p class="w-full text-center my-6">
			Answers within {$popdleState.tolerance * 100}% of the 2023 population estimate are accepted.
		</p>
	</div>
</div>
