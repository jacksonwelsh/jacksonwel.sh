<script>
	import { fade, scale } from 'svelte/transition';
	import Divider from '$lib/divider.svelte';

	// no dynamic content, so go ahead and make this static.
	export const prerender = true;

	let name = '';
	let cursorVisible = true;
	let showSocial = false;

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
			class: 'text-sky-700 dark:text-sky-300 cursor-pointer',
			onClick: () => (showSocial = !showSocial)
		}
	];

	buildName(target);
	flashCursor();
</script>

<main class="container mx-auto h-screen flex content-center flex-wrap px-2 md:px-0 transition-all">
	<div class="w-full transition-all">
		<h1 class="text-6xl lg:text-6xl xl:text-8xl font-semibold font-mono">
			{name}{#if cursorVisible}<span class="transition-all duration-75">_</span>{/if}
		</h1>
	</div>
	{#if name === 'Jackson Welsh'}
		<div in:fade class="text-xl w-full transition-all">
			{#each links as { name, href, class: className, onClick }, idx}
				{#if href}
					<a
						{href}
						class={className}
						on:click={onClick}
						target={href.startsWith('//') ? '_blank' : ''}>{name}</a
					>
				{:else}
					<button class={className} on:click={onClick}>{name}</button>
				{/if}
				{#if idx !== links.length - 1}<Divider />&nbsp;{/if}
			{/each}
		</div>

		{#if showSocial}
			<div class="text-xl" transition:fade|local>
				<a
					href="//linkedin.com/in/jacksonwelsh"
					target="_blank"
					class="text-blue-900 dark:text-blue-400">linkedin</a
				>
				<Divider />
				<a href="//github.com/jacksonwelsh" target="_blank" class="text-gray-700 dark:text-gray-400"
					>github</a
				>
				<Divider />
				me@${'{'}window.location.host}
			</div>
		{:else}
			<div class="text-xl">&nbsp;</div>
		{/if}
	{:else}
		<div class="text-xl w-full">&nbsp;</div>
		<div class="text-xl w-full">&nbsp;</div>
	{/if}
	<noscript>
		<div class="w-full">
			<h1 class="text-6xl lg:text-6xl xl:text-8xl font-semibold font-mono">Jackson Welsh_</h1>
		</div>
		<div in:fade class="text-transparent text-xl">
			{#each links.slice(0, links.length - 1) as { name, href, class: className }, idx}
				<a {href} class={className}>{name}</a>
				{#if idx !== links.length - 2}<Divider />&nbsp;{/if}
			{/each}
		</div>
		<div class="text-xl" transition:fade|local>
			<a href="//twitter.com/_jacksonwelsh" target="_blank" class="text-blue-700 dark:text-blue-300"
				>twitter</a
			>
			<Divider />
			<a
				href="//linkedin.com/in/jacksonwelsh"
				target="_blank"
				class="text-blue-900 dark:text-blue-400">linkedin</a
			>
			<Divider />
			<a href="//github.com/jacksonwelsh" target="_blank" class="text-gray-700 dark:text-gray-400"
				>github</a
			>
			<Divider />
			me@${'{'}window.location.host}
		</div>
	</noscript>
</main>
