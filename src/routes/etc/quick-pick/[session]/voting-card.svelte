<script lang="ts">
	import type { NominationMetadata } from '../workers';
	import { countryCodeToFlag } from '../workers';

	interface Props {
		id: string;
		text: string;
		vote: number;
		totalNominations: number;
		metadata?: NominationMetadata;
		onclick?: () => void;
	}

	let {
		id,
		text,
		vote,
		totalNominations,
		metadata,
		onclick
	}: Props = $props();
</script>

<button
	class={`w-full text-left grid grid-cols-4 rounded-md px-4 py-2 my-2 ring-1 ring-inset border-black dark:ring-cyan-400/20 transition-all ${vote !== -1 ? 'bg-cyan-200 dark:bg-cyan-400/10 text-cyan-800 dark:text-cyan-400' : ''}`}
	{onclick}
>
	<div class="col-span-3">
		<span class="font-medium">{text}</span>
		{#if metadata}
			<div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
				{#if metadata.originCountry}
					<span>{countryCodeToFlag(metadata.originCountry)}</span>
				{/if}
				{#if metadata.year}
					<span>{metadata.year}</span>
				{/if}
				{#if metadata.genres && metadata.genres.length > 0}
					<span class="mx-1">&middot;</span>
					<span>{metadata.genres.slice(0, 3).join(', ')}</span>
				{/if}
				{#if metadata.director}
					<span class="mx-1">&middot;</span>
					<span>Dir. {metadata.director}</span>
				{/if}
			</div>
			{#if metadata.tagline}
				<div class="text-sm italic text-gray-400 dark:text-gray-500 mt-1">
					"{metadata.tagline}"
				</div>
			{/if}
		{/if}
	</div>
	{#if vote !== -1}<span class="text-right font-mono font-mono-bold self-center">{vote + 1}</span>{/if}
</button>
