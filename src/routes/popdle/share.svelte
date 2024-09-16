<script lang="ts">
	export let results: HintState[] = [];

	import Button from '$lib/button.svelte';
	import { HintState, getScore } from '.';

	let clicked = false;

	const emojiMap = {
		[HintState.VERY_LOW]: '🟪',
		[HintState.LOW]: '🟦',
		[HintState.CORRECT]: '🟩',
		[HintState.HIGH]: '🟧',
		[HintState.VERY_HIGH]: '🟥',
		[HintState.UNKNOWN]: '',
		[HintState.DISABLED]: ''
	};

	const buildShareString = (results: HintState[]) => {
		const score = getScore(results);
		const scoreString = score === 0 ? 'X' : score.toString();

		let ret = `Popdle #0 ${scoreString}/6\n\n`;

		for (let r of results) {
			ret += emojiMap[r];
		}

		ret += '\n\nhttps://jacksonwel.sh/popdle';
		return ret;
	};

	const copyShareString = () => {
		const shareString = buildShareString(results);
		navigator.clipboard.writeText(shareString);

		clicked = true;
		setTimeout(() => (clicked = false), 2500);
	};

	$: buttonText = clicked ? 'Copied!' : 'Share results';
</script>

<Button
	on:click={() => copyShareString()}
	variant="primary"
	size="xl"
	class="w-full sm:w-[32rem] rounded-md"
>
	{buttonText}
</Button>
