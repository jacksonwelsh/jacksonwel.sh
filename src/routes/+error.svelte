<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/button.svelte';

	const is404 = $derived($page.status === 404);
	const is500 = $derived($page.status >= 500);
</script>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
	</div>
</div>

<section class="container mx-auto px-2 md:px-0 flex h-screen flex-wrap content-center relative">
	<div class="w-full max-w-lg mx-auto text-center">
		{#if is404}
			<div class="text-8xl mb-4 opacity-20 font-bold">404</div>
			<h1 class="font-bold text-4xl mb-4">Page not found</h1>
			<p class="text-gray-600 dark:text-gray-400 mb-8">
				The page you're looking for doesn't exist or has been moved.
			</p>
		{:else if is500}
			<div class="text-8xl mb-4 font-bold text-red-500/20 dark:text-red-400/20">500</div>
			<h1 class="font-bold text-4xl mb-4">Something broke</h1>
			<p class="text-gray-600 dark:text-gray-400 mb-4">
				We hit an unexpected error while processing your request.
			</p>
			{#if $page.error?.message}
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-left">
					<p class="text-sm font-mono text-red-700 dark:text-red-300 break-words">
						{$page.error.message}
					</p>
				</div>
			{/if}
		{:else}
			<div class="text-8xl mb-4 opacity-20 font-bold">{$page.status}</div>
			<h1 class="font-bold text-4xl mb-4">Oops</h1>
			<p class="text-gray-600 dark:text-gray-400 mb-8">
				{$page.error?.message ?? 'Something unexpected happened.'}
			</p>
		{/if}

		<div class="flex gap-4 justify-center">
			<a href="/">
				<Button>Go home</Button>
			</a>
			<Button onclick={() => window.location.reload()}>Try again</Button>
		</div>
	</div>
</section>
