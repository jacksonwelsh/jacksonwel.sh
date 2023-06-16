<script lang="ts">
	import { Passage } from '@passageidentity/passage-js';
	import type { PageServerData } from './$types';
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
	import Locked16 from 'carbon-icons-svelte/lib/Locked16';
	import type { Block, GBlock, ParagraphData } from '$lib/types';
	import { onMount } from 'svelte';

	export let data: PageServerData;
	const { posts } = data;

	const toDateString = (timestamp: any): string => {
		if (typeof timestamp === 'string') timestamp = parseInt(timestamp);
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const passage = new Passage(PUBLIC_PASSAGE_APP_ID);
	const user = passage.getCurrentUser();

	const signOut = () => {
		passage.getCurrentSession().signOut();
		document.cookie = '';
		window.location.reload();
	};

	const isAuthorized = async (content: any): Promise<boolean> => {
		const session = passage.getCurrentSession();
		const isSignedIn = await session.authGuard();
		if (isSignedIn) return true;

		const forcePrivacy = content?.forcePrivacy;
		if (forcePrivacy != null) return !forcePrivacy;

		const time = content.time;
		if (!time) return false;

		const now = new Date().getTime();
		// only allow if post is > 5 days old
		return now > time + 86400 * 5 * 1000;
	};

	const makeExcerpt = (content: any): string => {
		const typedContent = content as Block[];
		const paragraphs: Array<GBlock<'paragraph', ParagraphData>> = content?.blocks.filter(
			(block: any) => block.type === 'paragraph'
		);
		if (paragraphs.length === 0) return '';
		const firstParagraph = paragraphs[0];
		const text = firstParagraph.data.text;
		if (text.length > 200) return text.slice(0, 200) + '...';
		return text;
	};

	onMount(() => {
		// passkeys only work on jacksonwel.sh
		const domain = window.location.host;
		if (domain.includes('localhost')) return;
		if (domain !== 'jacksonwel.sh')
			window.location.replace(`https://jacksonwel.sh${window.location.pathname}`);
	});
</script>

<main class="container mx-auto sm:px-4 lg:max-w-5xl my-12">
	<div class="my-12">
		<h1 class="text-4xl font-bold mb-4 font-mono">travel</h1>
		<p>
			A simple travel blog that I'm updating as I go. Check my <a
				href="/travel/pre-departure"
				class="underline">pre-departure notes</a
			> for more info about how this all works.
		</p>
	</div>
	{#if user}
		{#await user.getMetadata()}
			<p>thinking...</p>
		{:then metadata}
			{#if metadata && metadata.isjackson}
				<a href="/travel/write">write</a>
			{/if}
			<button on:click={signOut}>log out</button>
		{:catch}
			<a href="/travel/login">login</a>
		{/await}
	{/if}
	<div class="grid gap-4">
		{#each posts as post}
			{#await isAuthorized(post.content) then allowed}
				{#if allowed}
					<a href={`/travel/${post.slug}`}>
						<div
							class="rounded-md dark:bg-gray-900/50 bg-gray-200/50 p-4 hover:bg-gray-200/75 dark:hover:bg-gray-900/75 transition border border-gray-300 dark:border-gray-700"
						>
							<div class="mb-2">
								<h2 class="text-xl font-bold">{post.title}</h2>
								<span class="text-sm text-gray-400 dark:text-gray-600"
									>{toDateString(post.content.time)}</span
								>
							</div>
							<p>{post.excerpt ?? makeExcerpt(post.content)}</p>
						</div>
					</a>
				{:else}
					<div>
						<div
							class="rounded-md dark:bg-gray-900/50 bg-gray-200/50 p-4 hover:bg-gray-200/75 dark:hover:bg-gray-900/75 transition border border-gray-300 dark:border-gray-700"
						>
							<div class="mb-2">
								<h2 class="text-xl font-bold flex items-center gap-1">
									<Locked16 class="h-5 w-5" />
									{post.title}
								</h2>
								<span class="text-sm text-gray-400 dark:text-gray-600"
									>{toDateString(post.content.time)}</span
								>
							</div>
							<p class="italic">
								This post will be available to logged out users 5 days after its publish date.
							</p>
						</div>
					</div>
				{/if}
			{/await}
		{/each}
	</div>
</main>
