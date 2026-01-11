<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/button.svelte';

	const is404 = $derived($page.status === 404);
</script>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		<a href="/etc/quick-pick" class="text-blue-400 hover:underline">/quick-pick</a>
	</div>
</div>

<section class="container mx-auto px-2 md:px-0 flex h-screen flex-wrap content-center relative">
	<div class="w-full max-w-lg mx-auto text-center">
		{#if is404}
			<div class="text-8xl mb-4 opacity-20 font-bold">404</div>
			<h1 class="font-bold text-4xl mb-4">Session not found</h1>
			<p class="text-gray-600 dark:text-gray-400 mb-8">
				This session doesn't exist or may have expired.<br/>
				Double-check the code and try again.
			</p>
		{:else}
			<div class="text-8xl mb-4 opacity-20 font-bold">{$page.status}</div>
			<h1 class="font-bold text-4xl mb-4">Something went wrong</h1>
			<p class="text-gray-600 dark:text-gray-400 mb-8">
				{$page.error?.message ?? 'An unexpected error occurred.'}
			</p>
		{/if}

		<div class="flex gap-4 justify-center">
			<a href="/etc/quick-pick">
				<Button>Back to Quick Pick</Button>
			</a>
			<Button onclick={() => window.location.reload()}>Try again</Button>
		</div>
	</div>
</section>
