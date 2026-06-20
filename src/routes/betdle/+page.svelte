<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import { onMount } from 'svelte';

	import Button from '$lib/button.svelte';
	import {
		type DailyState,
		GuessResult,
		MAX_GUESSES,
		REVEAL_ORDER,
		BETDLE_DAILY_STATE_LS,
		BETDLE_SCORE_LS,
		getScore,
		hintValue
	} from '.';
	import OddsChart from './odds-chart.svelte';
	import Hints from './hints.svelte';
	import GuessBox from './guess-box.svelte';
	import Share from './share.svelte';
	import type { PageServerData } from './$types';

	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	const { puzzle, titles } = data;

	let guessIndex = $state(0);
	let hasWon = $state(false);
	let gameOver = $state(false);
	let selected = $state('');

	const guesses = $state<string[]>(new Array(MAX_GUESSES).fill(''));
	const results = $state<GuessResult[]>(new Array(MAX_GUESSES).fill(GuessResult.UNUSED));
	let guessBox: GuessBox | undefined = $state();

	// Number of unlocked hints == number of wrong guesses so far (capped at the hint count).
	const revealed = $derived(Math.min(guessIndex, REVEAL_ORDER.length));
	const resolutionIdx = REVEAL_ORDER.findIndex((h) => h.key === 'resolutionDate');
	const showResolution = $derived(gameOver || revealed > resolutionIdx);

	onMount(() => loadDailyState());

	const saveResults = () => {
		const currentResults = window.localStorage.getItem(BETDLE_SCORE_LS);

		let newResults: Record<number, number> = {};
		if (currentResults) {
			newResults = JSON.parse(currentResults);
		}

		newResults[puzzle.index] = getScore(results);
		window.localStorage.setItem(BETDLE_SCORE_LS, JSON.stringify(newResults));
	};

	const saveDailyState = () => {
		const state: DailyState = {
			puzzleIndex: puzzle.index,
			guesses,
			gameOver,
			hasWon
		};

		window.localStorage.setItem(BETDLE_DAILY_STATE_LS, JSON.stringify(state));
	};

	const loadDailyState = () => {
		const stateStr = window.localStorage.getItem(BETDLE_DAILY_STATE_LS);
		if (!stateStr) {
			return;
		}

		const state: DailyState = JSON.parse(stateStr);
		if (state.puzzleIndex !== puzzle.index) {
			// Clear stale state from a previous day.
			saveDailyState();
			return;
		}

		gameOver = state.gameOver;
		hasWon = state.hasWon;

		for (const guessIdx in state.guesses) {
			const stateGuess = state.guesses[guessIdx];
			if (stateGuess === '') {
				break;
			}

			guesses[guessIdx] = stateGuess;
			results[guessIdx] = stateGuess === puzzle.title ? GuessResult.CORRECT : GuessResult.WRONG;
			if (results[guessIdx] === GuessResult.WRONG) {
				++guessIndex;
			}
		}
	};

	const handleSubmit = () => {
		if (gameOver || hasWon || !selected) {
			return;
		}

		guesses[guessIndex] = selected;

		if (selected === puzzle.title) {
			results[guessIndex] = GuessResult.CORRECT;
			hasWon = true;
			gameOver = true;
			setTimeout(() => saveResults());
			saveDailyState();
			return;
		}

		results[guessIndex] = GuessResult.WRONG;
		++guessIndex;

		selected = '';
		guessBox?.clear();

		if (guessIndex >= MAX_GUESSES) {
			gameOver = true;
			setTimeout(() => saveResults());
			saveDailyState();
			return;
		}

		saveDailyState();
		guessBox?.focus();
	};
</script>

<svelte:head>
	<title>Betdle</title>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Jackson Welsh" />
	<meta property="og:title" content="Betdle" />
	<meta name="description" content="Guess the prediction market from its odds graph." />
	<meta name="og:description" content="Guess the prediction market from its odds graph." />
</svelte:head>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/betdle
	</div>
	<div id="wrapper" class="flex items-center justify-center m-2 min-h-screen">
		<main class="flex flex-wrap text-center items-center justify-center max-w-2xl w-full">
			<div id="header" class="flex flex-col items-center my-4 w-full">
				<h1 class="relative text-3xl sm:text-5xl font-mono font-mono-bold text-teal-500 mb-2">
					<span>Betdle</span>
					<div
						class="absolute -top-3 -right-12 h-6 flex items-center font-sans font-medium rounded-full px-2 py-0.5 border border-teal-500 text-white dark:text-teal-500 bg-teal-500 dark:bg-teal-900/50 text-sm"
					>
						beta
					</div>
				</h1>
				<p class="text-gray-600 dark:text-gray-400 italic">
					Guess the prediction market from its odds!
				</p>
			</div>

			<form onsubmit={preventDefault(() => handleSubmit())} id="game" class="w-full">
				<OddsChart
					series={puzzle.series}
					resolutionLabel={showResolution ? hintValue(puzzle, 'resolutionDate') : null}
					showLatest={gameOver}
				/>

				<Hints {puzzle} {revealed} />

				{#if hasWon}
					<p class="my-2">You got it! 🎉</p>
				{:else if gameOver}
					<p class="my-2">Better luck next time :/</p>
				{/if}

				{#if gameOver}
					<p class="my-2 font-mono font-mono-semibold text-lg">
						{puzzle.title}
					</p>
					{#if puzzle.url}
						<a
							class="text-teal-500 hover:underline text-sm"
							href={puzzle.url}
							target="_blank"
							rel="noreferrer"
						>
							View on {puzzle.platform === 'kalshi' ? 'Kalshi' : 'Polymarket'} ↗
						</a>
					{/if}
				{/if}

				{#if !gameOver}
					<GuessBox bind:this={guessBox} {titles} bind:value={selected} onpick={() => {}} />

					<p class="text-sm text-slate-400 my-1">
						Guess {guessIndex + 1} of {MAX_GUESSES}
					</p>

					<Button
						on:click={() => handleSubmit()}
						type="submit"
						disabled={!selected}
						variant="primary"
						size="xl"
						class="w-full sm:w-[32rem] rounded-md"
					>
						Guess
					</Button>
				{:else}
					<Share {results} index={puzzle.index} />
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
			Odds are sourced from public prediction-market data on
			<a class="font-bold underline" target="_blank" href="https://polymarket.com">Polymarket</a>
			and
			<a class="font-bold underline" target="_blank" href="https://kalshi.com">Kalshi</a>. The graph
			shows the market's implied probability over time — your job is to guess what it's tracking.
		</p>
	</div>
</div>
