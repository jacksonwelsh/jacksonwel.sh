<script>
	import { fade } from 'svelte/transition';
	import Divider from '$lib/divider.svelte';
  
  // no dynamic content, so go ahead and make this static.
  export const prerender = true;
	
  let name = '';
	let cursorVisible = true;

	let acclSpeed = 150;

	const target = 'Jackson Welsh';
	const buildName = (n) => {
		if (n.length === 0) return;
		setTimeout(() => {
			name += n.charAt(0);
			if (n.charAt(0) !== ' ') acclSpeed -= 17;
			else acclSpeed = 150;
			buildName(n.substring(1));
		}, acclSpeed);
	};

	const flashCursor = () => {
		cursorVisible = !cursorVisible;
		setTimeout(flashCursor, 400);
	};

	const links = [
		{
			name: 'thoughts',
			href: '/blog',
			class: 'text-green-700 dark:text-green-300'
		},
		{
			name: 'history',
			href: '/resume',
			class: 'text-teal-700 dark:text-teal-300'
		},
		{
			name: 'social',
			href: '/contact',
			class: 'text-sky-700 dark:text-sky-300'
		}
	];

	buildName(target);
	flashCursor();
</script>

<main class="container mx-auto h-screen flex content-center flex-wrap px-2 md:px-0">
	<div class="w-full">
		<h1 class="text-6xl lg:text-6xl xl:text-8xl font-semibold font-mono">
			{name}{#if cursorVisible}<span class="transition-all duration-75">_</span>{/if}
		</h1>
	</div>
	{#if name === 'Jackson Welsh'}
		<div in:fade class="text-transparent text-xl">
			{#each links as { name, href, class: className }, idx}
				<a {href} class={className}>{name}</a>
				{#if idx !== links.length - 1}<Divider />&nbsp;{/if}
			{/each}
		</div>
	{:else}
		<div class="text-xl">&nbsp;</div>
	{/if}
	<noscript>
		<div class="w-full">
			<h1 class="text-6xl lg:text-6xl xl:text-8xl font-semibold font-mono">Jackson Welsh_</h1>
		</div>
		<div in:fade class="text-transparent text-xl">
			{#each links as { name, href, class: className }, idx}
				<a {href} class={className}>{name}</a>
				{#if idx !== links.length - 1}<Divider />&nbsp;{/if}
			{/each}
		</div>
	</noscript>
</main>
