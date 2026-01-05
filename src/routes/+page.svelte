<script lang="ts">
	import { fade } from 'svelte/transition';
	import Divider from '$lib/divider.svelte';
	import { createNoise3D, type NoiseFunction3D } from 'simplex-noise';
	import { onDestroy, onMount } from 'svelte';
	import { isDarkTheme } from '../stores/theme';

	let canvas: HTMLCanvasElement = $state();
	let ctx: CanvasRenderingContext2D | null;

	let name = $state('');
	let cursorVisible = $state(true);
	let showSocial = $state(false);

	let acclSpeed = 150;

	const target = 'jackson welsh';
	const buildName = (n: string) => {
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
			name: 'blog',
			href: '/blog',
			class: ''
		},
		{
			name: 'history',
			href: '/resume',
			class: ''
		},
		{
			name: 'social',
			class: 'cursor-pointer',
			onClick: () => (showSocial = !showSocial)
		}
	];

	let t = 0;

	const backgroundGraphics = (noise3d: NoiseFunction3D, imageData: ImageData) => {
		if (ctx == null) {
			return;
		}

		const widthMajor = canvas.clientHeight < canvas.clientWidth;

		const minorAxis = widthMajor ? canvas.height : canvas.width;
		const majorAxis = widthMajor ? canvas.width : canvas.height;

		for (let a = 0; a < majorAxis; a++) {
			for (let k = 0; k < minorAxis; k++) {
				const r = noise3d(a / 110, k / 300, t / 70 / 8);
				const g = noise3d(a / 120, k / 315, t / 100 / 8);
				const b = noise3d(a / 130, k / 330, t / 130 / 8);

				const basePos = widthMajor ? a + k * canvas.width : k + a * canvas.width;

				if ($isDarkTheme) {
					imageData.data[basePos * 4 + 0] = ((r + b) * 255) / 4;
					imageData.data[basePos * 4 + 1] = ((g + r) * 255) / 2;
					imageData.data[basePos * 4 + 2] = ((b + r + g) * 255) / 3;
					imageData.data[basePos * 4 + 3] = 255; //Math.random() * 5 + 250;
				} else {
					imageData.data[basePos * 4 + 0] = 255 - ((r + b) * 255) / 3;
					imageData.data[basePos * 4 + 1] = 255 - ((g + r) * 255) / 2;
					imageData.data[basePos * 4 + 2] = 255 - ((b + r + g) * 255) / 6;
					imageData.data[basePos * 4 + 3] = 255; //Math.random() * 5 + 250;
				}
			}
		}
		ctx.putImageData(imageData, 0, 0);
		++t;
	};

	let scheduledGraphics: NodeJS.Timeout;

	onMount(() => {
		const isReduced = matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

		if (isReduced) {
			// skip build and just show the name
			name = target;
		} else {
			buildName(target);
			flashCursor();
		}

		if (canvas == null) {
			return;
		}

		ctx = canvas.getContext('2d');
		if (ctx == null) {
			return;
		}

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const noise3d = createNoise3D();

		if (isReduced) {
			// run the first frame and leave it
			backgroundGraphics(noise3d, imageData);
		} else {
			// continuously run
			scheduledGraphics = setInterval(() => backgroundGraphics(noise3d, imageData), 15);
		}
	});

	onDestroy(() => {
		if (scheduledGraphics) clearInterval(scheduledGraphics);
	});
</script>

<svelte:head>
	<title>Jackson Welsh</title>
</svelte:head>

<main
	class="container mx-auto h-screen flex content-center flex-wrap px-2 md:px-0 transition-all font-mono dark:text-slate-100"
>
	<canvas
		bind:this={canvas}
		id="gradient-canvas"
		class="absolute h-screen w-screen top-0 left-0 -z-40 overflow-hidden"
		data-transition-in
	></canvas>
	<div class="w-full transition-all sm:h-auto">
		<h1
			class="dark drop-shadow-lg text-6xl lg:text-6xl xl:text-8xl font-mono-medium dark:text-slate-100"
		>
			{name}{#if cursorVisible}<span class="transition-all duration-75">_</span>{/if}
		</h1>
	</div>
	{#if name === target}
		<div
			in:fade
			class="dark drop-shadow-lg text-xl w-full transition-all font-mono-normal mt-6 mb-2"
		>
			{#each links as { name, href, class: className, onClick }, idx}
				{#if href}
					<a
						{href}
						class={className}
						onclick={onClick}
						target={href.startsWith('//') ? '_blank' : ''}>{name}</a
					>
				{:else}
					<button class={className} onclick={onClick}>{name}</button>
				{/if}
				{#if idx !== links.length - 1}<Divider />&nbsp;{/if}
			{/each}
		</div>

		{#if showSocial}
			<div class="text-xl font-mono-normal" transition:fade|local>
				<a href="//linkedin.com/in/jacksonwelsh" target="_blank">linkedin</a>
				<Divider />
				<a href="//github.com/jacksonwelsh" target="_blank">github</a>
				<Divider />
				hello@jacksonwel.sh
			</div>
		{:else}
			<div class="text-xl">&nbsp;</div>
		{/if}
	{:else}
		<div class="text-xl w-full mt-6 mb-2">&nbsp;</div>
		<div class="text-xl w-full">&nbsp;</div>
	{/if}
	<noscript>
		<div class="w-full">
			<h1 class="text-6xl lg:text-6xl xl:text-8xl font-semibold font-mono">{target}_</h1>
		</div>
		<div in:fade class="text-transparent text-xl">
			{#each links.slice(0, links.length - 1) as { name, href, class: className }, idx}
				<a {href} class={className}>{name}</a>
				{#if idx !== links.length - 2}<Divider />&nbsp;{/if}
			{/each}
		</div>
		<div class="text-xl" transition:fade|local>
			<a href="//linkedin.com/in/jacksonwelsh" target="_blank">linkedin</a>
			<Divider />
			<a href="//github.com/jacksonwelsh" target="_blank">github</a>
			<Divider />
			hello@jacksonwel.sh
		</div>
	</noscript>
</main>
