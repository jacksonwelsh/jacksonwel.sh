<script lang="ts">
	import { run } from 'svelte/legacy';

	import { alphabet, chunks, getByteColor, HIGHLIGHT_CLASS } from './mfaUtils';
	import { clearHoverRange, hoverBinRange, secret, secretBytes } from './store';

	let charRefs: HTMLSpanElement[] = $state(new Array($secretBytes.length * 8));
	let secretBytesBinString = $state('');

	run(() => {
		if (charRefs.length !== $secret.length * 5) {
			charRefs = new Array($secret.length * 5);
		}
	});

	run(() => {
		secretBytesBinString = $secretBytes.reduce((prev, byte) => {
			prev += byte.toString(2).padStart(8, '0');
			return prev;
		}, '');
	});

	const pushHoverRange = (lineIdx: number, chunkIdx: number) => {
		const start = lineIdx * 40 + chunkIdx * 5;
		const end = lineIdx * 40 + (chunkIdx + 1) * 5;

		$hoverBinRange = [start, end];
	};

	run(() => {
		// first clear any previously hovered items
		charRefs
			.filter(
				(char, i) =>
					char.classList.contains(HIGHLIGHT_CLASS) &&
					!($hoverBinRange[0] <= i && i < $hoverBinRange[1])
			)
			.forEach((bit) => bit.classList.remove(HIGHLIGHT_CLASS));

		// then apply the class to newly hovered items
		charRefs
			.filter(
				(char, i) =>
					!char.classList.contains(HIGHLIGHT_CLASS) &&
					$hoverBinRange[0] <= i &&
					i < $hoverBinRange[1]
			)
			.forEach((bit) => bit.classList.add(HIGHLIGHT_CLASS));
	});
</script>

{#each chunks(chunks(Array.from(secretBytesBinString), 5), 8) as line, lineIdx}
	<div class={`flex items-center justify-center gap-2 my-2 ${getByteColor(lineIdx, 1)}`}>
		{#each line as chunk, chunkIdx}
			<div
				class="flex flex-wrap items-center justify-center text-center font-mono font-mono-normal w-[5ch] text-xs sm:text-sm md:text-base"
				style="-webkit-user-select: none"
				role="presentation"
				ontouchstart={() => pushHoverRange(lineIdx, chunkIdx)}
				onmouseenter={() => pushHoverRange(lineIdx, chunkIdx)}
				onmouseleave={clearHoverRange}
			>
				<div class="text-center w-full">
					{alphabet.at(parseInt(chunk.join(''), 2))}
				</div>
				<div class="w-full text-center">
					{#each chunk as char, charIdx}<span
							bind:this={charRefs[lineIdx * 40 + chunkIdx * 5 + charIdx]}>{char}</span
						>{/each}
				</div>
			</div>
		{/each}
	</div>
{/each}
