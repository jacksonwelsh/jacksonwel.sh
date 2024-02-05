<script lang="ts">
	import HeadingBlock from '$lib/editor/headingBlock.svelte';
	import ImageBlock from '$lib/editor/imageBlock.svelte';
	import ParagraphBlock from '$lib/editor/paragraphBlock.svelte';
	import QuoteBlock from '$lib/editor/quoteBlock.svelte';
	import ListBlock from '$lib/editor/listBlock.svelte';
	import type { PageData } from './$types';
	import { ArrowLeft } from 'carbon-icons-svelte';

	export let data: PageData;
	console.log({ data });
	const { title, slug, content, postId } = data;

	console.log({ content: data.content });

	const toDateString = (timestamp: number): string => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<article class="container mx-auto sm:px-4 max-w-[80ch] mb-12">
	{#if content}
		<div class="my-12">
			<a href="/travel" class="flex items-center mb-1 text-gray-600 dark:text-gray-400 text-sm">
				<ArrowLeft size={16} class="inline-block mr-2 h-4 w-4" /> all posts
			</a>
			<h1 class="text-4xl font-bold">{title}</h1>
			<span class="text-sm text-gray-400 dark:text-gray-600">{toDateString(content.time)}</span>
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
			{:else if block.type === 'list'}
				<ListBlock id={block.id} data={block.data} />
			{/if}
		{/each}
	{:else}
		failed to load content
	{/if}
</article>
