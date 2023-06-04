<script lang="ts">
	import HeadingBlock from '$lib/editor/headingBlock.svelte';
	import ImageBlock from '$lib/editor/imageBlock.svelte';
	import ParagraphBlock from '$lib/editor/paragraphBlock.svelte';
	import QuoteBlock from '$lib/editor/quoteBlock.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const { title, excerpt, timestamp, content } = data;

	const toDateString = (timestamp: number): string => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<article class="container mx-auto sm:px-4 max-w-[80ch]">
	<div class="my-12">
		<h1 class="text-4xl font-bold">{title}</h1>
		<span class="text-sm text-gray-400 dark:text-gray-600">{toDateString(timestamp)}</span>
	</div>
	{#each content.blocks as block}
		{#if block.type === 'header'}
			<HeadingBlock id={block.id} data={block.data} />
		{:else if block.type === 'paragraph'}
			<ParagraphBlock id={block.id} data={block.data} />
		{:else if block.type === 'image'}
			<ImageBlock id={block.id} data={block.data} />
		{:else if block.type === 'quote'}
			<QuoteBlock id={block.id} data={block.data} />
		{/if}
	{/each}
</article>
