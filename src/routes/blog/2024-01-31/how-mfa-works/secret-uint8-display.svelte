<script lang="ts">
	import { getByteColor, HIGHLIGHT_CLASS } from './mfaUtils';

	import { secretBytes, hoverBinRange, clearHoverRange, secret } from './store';

	let byteRefs: HTMLSpanElement[] = new Array($secretBytes.length);

	$: {
		if (byteRefs.length !== ($secret.length * 5) / 8) {
			console.log(`byteRefs length mismatch! ${byteRefs.length} !== ${($secret.length * 5) / 8}`);
			byteRefs = new Array(($secret.length * 5) / 8);
		}
	}

	const pushHoverRange = (index: number) => {
		const start = index * 8;
		const end = (index + 1) * 8;

		$hoverBinRange = [start, end];
	};

	$: {
		// first clear any previously hovered items
		byteRefs
			.filter(
				(byte, i) =>
					byte.classList.contains(HIGHLIGHT_CLASS) &&
					!($hoverBinRange[0] / 8 <= i && i < $hoverBinRange[1] / 8)
			)
			.forEach((bit) => bit.classList.remove(HIGHLIGHT_CLASS));

		// then apply the class to newly hovered items
		byteRefs
			.filter(
				(byte, i) =>
					!byte.classList.contains(HIGHLIGHT_CLASS) &&
					Math.floor($hoverBinRange[0] / 8) <= i &&
					i < $hoverBinRange[1] / 8
			)
			.forEach((bit) => bit.classList.add(HIGHLIGHT_CLASS));
	}
</script>

<div class="mx-auto grid grid-cols-5 text-center w-[40ch]">
	{#each $secretBytes as byte, i}
		<!-- this one specifically doesn't play nice with on:pointerenter alone, likely something to do with the grid layout-->
		<span
			on:mouseenter={() => pushHoverRange(i)}
			on:pointerenter={() => pushHoverRange(i)}
			on:mouseleave={clearHoverRange}
			bind:this={byteRefs[i]}
			style="-webkit-user-select: none"
			class={`font-mono font-mono-normal ${getByteColor(i, 5)}`}>{byte}</span
		>
	{/each}
</div>
