<script lang="ts">
	import type { PageServerData } from './$types';
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
	import Locked from 'carbon-icons-svelte/lib/Locked.svelte';
	import { onMount } from 'svelte';
	import Button from '$lib/button.svelte';

	interface Props {
		data: PageServerData;
	}

	let { data }: Props = $props();
	const { listing } = data;
    let user = null;

	const toDateString = (timestamp: any): string => {
		if (typeof timestamp === 'string') timestamp = parseInt(timestamp);
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const isAuthorized = async (time: number, forcePrivacy?: boolean): Promise<boolean> => {
		if (forcePrivacy != null) return !forcePrivacy;

		if (!time) return false;

		const now = new Date().getTime();
		// only allow if post is > 5 days old
		return now > time + 86400 * 5 * 1000;
	};

	onMount(async () => {
		// passkeys only work on jacksonwel.sh
		const domain = window.location.host;
		if (domain !== 'jacksonwel.sh' && process.env.NODE_ENV === 'production')
			window.location.replace(`https://jacksonwel.sh${window.location.pathname}`);

		const isSignedIn = false;
		if (!isSignedIn) user = null;
	});
</script>

<svelte:head>
	<title>Travel | Jackson Welsh</title>
</svelte:head>

<main class="container mx-auto sm:px-4 lg:max-w-5xl my-12">
	<div class="mt-12 mb-6">
		<h1 class="text-4xl font-bold mb-4 font-mono">travel</h1>
		<p>
			A simple travel blog that I'm updating as I go. Check my <a
				href="/travel/pre-departure"
				class="underline">pre-departure notes</a
			> for more info about how this all works.
		</p>
	</div>
	<div class="my-6 flex gap-2">
		{#if user}
			{#await user?.metadata()}
				<p>thinking...</p>
			{:then metadata}
				{#if metadata && metadata.isjackson}
					<Button kind="a" href="/travel/write" variant="primary">write</Button>
					<Button kind="a" href="/travel/users" variant="secondary">users</Button>
				{/if}
				<Button on:click={signOut} variant="danger">log out</Button>
			{:catch}
				<a
					href="/travel/login"
					class="rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-cyan-400/10 dark:text-cyan-400 dark:ring-1 dark:ring-inset dark:ring-cyan-400/20 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300 dark:hover:ring-cyan-300 inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition"
					>login</a
				>
			{/await}
		{:else}
			<a
				href="/travel/login"
				class="rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-cyan-400/10 dark:text-cyan-400 dark:ring-1 dark:ring-inset dark:ring-cyan-400/20 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300 dark:hover:ring-cyan-300 inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition"
				>login</a
			>
		{/if}
	</div>
	<div class="grid divide-y divide-gray-300 dark:divide-gray-700">
		{#each listing as post}
			{#await isAuthorized(post.time, post.forcePrivacy) then allowed}
				{#if allowed}
					<a href={`/travel/${post.slug}`}>
						<div class="p-4 hover:bg-gray-200/75 dark:hover:bg-gray-900/75 transition py-6">
							<div class="mb-2">
								<h2 class="text-xl font-bold">{post.title}</h2>
								<span class="text-sm text-gray-400 dark:text-gray-600"
									>{toDateString(post.time)}</span
								>
							</div>
							<p>{post.excerpt}</p>
						</div>
					</a>
				{:else}
					<div>
						<div
							class="rounded-md dark:bg-gray-900/50 bg-gray-200/50 p-4 hover:bg-gray-200/75 dark:hover:bg-gray-900/75 transition border border-gray-300 dark:border-gray-700"
						>
							<div class="mb-2">
								<h2 class="text-xl font-bold flex items-center gap-1">
									<Locked size={16} class="h-5 w-5" />
									{post.title}
								</h2>
								<span class="text-sm text-gray-400 dark:text-gray-600"
									>{toDateString(post.time)}</span
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
