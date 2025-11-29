<script lang="ts">

	import Button from '$lib/button.svelte';
	import { HintState, getScore } from '.';
	interface Props {
		results?: HintState[];
		index: number;
	}

	let { results = [], index }: Props = $props();

	let clicked = $state(false);

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

		let ret = `Popdle #${index} ${scoreString}/6\n\n`;

		for (let r of results) {
			ret += emojiMap[r];
		}

		ret += '\n\n<https://jacksonwel.sh/popdle>';
		return ret;
	};

	const copyShareString = () => {
		const shareString = buildShareString(results);
		navigator.clipboard.writeText(shareString);

		clicked = true;
		setTimeout(() => (clicked = false), 2500);
	};

	let buttonText = $derived(clicked ? 'Copied!' : 'Share results');
</script>

<Button
	on:click={() => copyShareString()}
	variant="primary"
	size="xl"
	class="w-full sm:w-[32rem] rounded-md"
>
	{buttonText}
</Button>
