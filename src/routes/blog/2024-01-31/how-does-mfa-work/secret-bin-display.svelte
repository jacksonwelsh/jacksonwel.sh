<script lang="ts">
	import { chunks, getByteColor, HIGHLIGHT_CLASS } from './mfaUtils';

	import { clearHoverRange, hoverBinRange, secretBytes } from './store';

	let bitRefs: HTMLSpanElement[] = new Array($secretBytes.length * 8);

	const pushHoverRange = (chunkIndex: number, byteIndex: number) => {
		const start = chunkIndex * 40 + byteIndex * 8;
		const end = chunkIndex * 40 + (byteIndex + 1) * 8;

		$hoverBinRange = [start, end];
	};

	$: {
		// first clear any previously hovered items
		bitRefs
			.filter(
				(bit, i) =>
					bit.classList.contains(HIGHLIGHT_CLASS) &&
					!($hoverBinRange[0] <= i && i < $hoverBinRange[1])
			)
			.forEach((bit) => bit.classList.remove(HIGHLIGHT_CLASS));

		// then apply the class to newly hovered items
		bitRefs
			.filter(
				(bit, i) =>
					!bit.classList.contains(HIGHLIGHT_CLASS) &&
					$hoverBinRange[0] <= i &&
					i < $hoverBinRange[1]
			)
			.forEach((bit) => bit.classList.add(HIGHLIGHT_CLASS));
	}
</script>

{#each chunks(Array.from($secretBytes), 5) as chunk, chunkIndex}
	<div class={`flex items-center justify-center gap-2 my-2 ${getByteColor(chunkIndex, 1)}`}>
		{#each chunk as byte, byteIndex}
			<span
				on:mouseenter={() => pushHoverRange(chunkIndex, byteIndex)}
				on:mouseleave={() => clearHoverRange()}
				class={`font-mono font-mono-normal`}
				>{#each Array.from(byte.toString(2).padStart(8, '0')) as bit, bitIndex}
					<span bind:this={bitRefs[chunkIndex * 40 + byteIndex * 8 + bitIndex]}>{bit}</span>
				{/each}</span
			>
		{/each}
	</div>
{/each}
