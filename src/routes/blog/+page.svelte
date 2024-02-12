<script>
	import entries from './entries';
</script>

<svelte:head>
	<title>Blog | Jackson Welsh</title>
</svelte:head>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/blog
	</div>
</div>

<section class="container mx-auto flex h-screen flex-wrap content-center relative">
	<h1 class="font-bold text-6xl w-full">blog</h1>
	<ul class="my-4">
		{#each entries as post}
			<li>
				<div class="inline font-mono font-light mr-4">
					{post.date}
					<a class="underline w-full mt-6" href={`/blog/${post.date}/${post.slug}`}>{post.title}</a>
				</div>
			</li>
		{/each}
	</ul>
</section>
