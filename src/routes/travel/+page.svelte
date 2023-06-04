<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData;
	const { posts } = data;

	const toDateString = (timestamp: number): string => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<main class="container mx-auto sm:px-4 lg:max-w-5xl">
	<h1 class="text-4xl font-bold my-12">travel</h1>
	<a href="/travel/write">write</a>
	<div class="grid gap-4">
		{#each posts as post}
			<a href={`/travel/${post.slug}`}>
				<div
					class="rounded-md dark:bg-gray-900/50 bg-gray-200/50 p-4 hover:bg-gray-200/75 dark:hover:bg-gray-900/75 transition border border-gray-300 dark:border-gray-700"
				>
					<div class="mb-2">
						<h2 class="text-xl font-bold">{post.title}</h2>
						<span class="text-sm text-gray-400 dark:text-gray-600"
							>{toDateString(post.timestamp)}</span
						>
					</div>
					<p>{post.excerpt}</p>
				</div>
			</a>
		{/each}
	</div>
</main>
