<script lang="ts">
	import { fade } from 'svelte/transition';
	import Divider from '$lib/divider.svelte';
	import {
		createNoise2D,
		createNoise3D,
		type NoiseFunction2D,
		type NoiseFunction3D
	} from 'simplex-noise';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;

	let name = '';
	let cursorVisible = true;
	let showSocial = false;

	let acclSpeed = 150;

	const target = 'Jackson Welsh';
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
			name: 'travel',
			href: '/travel',
			class: 'text-green-300'
		},
		{
			name: 'history',
			href: '/resume',
			class: 'text-teal-300'
		},
		{
			name: 'social',
			class: 'text-sky-300 cursor-pointer',
			onClick: () => (showSocial = !showSocial)
		}
	];

	let t = 0;

	const backgroundGraphics = (noise3d: NoiseFunction3D, imageData: ImageData) => {
		if (canvas == null) {
			console.log('no canvas :(');
			return;
		} else {
			console.log('canvas! :)');
		}

		if (ctx == null) {
			return;
		}

		const maxDimension = Math.max(canvas.width, canvas.height);
		const minDimension = Math.min(canvas.width, canvas.height);
		if (maxDimension === canvas.width) {
			console.info(`width is longer! (${canvas.width} > ${canvas.height}))`);
		} else {
			console.info('height is longer!');
		}
		for (let a = 0; a < maxDimension; a++) {
			for (let k = 0; k < minDimension; k++) {
				const r = noise3d(a / 110, k / 300, t / 70 / 8);
				const g = noise3d(a / 120, k / 315, t / 100 / 8);
				const b = noise3d(a / 130, k / 330, t / 130 / 8);

				imageData.data[(a + k * maxDimension) * 4 + 0] = ((r + b) * 255) / 4;
				imageData.data[(a + k * maxDimension) * 4 + 1] = ((g + r) * 255) / 2;
				imageData.data[(a + k * maxDimension) * 4 + 2] = ((b + r + g) * 255) / 3;
				imageData.data[(a + k * maxDimension) * 4 + 3] = 255; //Math.random() * 5 + 250;
			}
		}
		ctx.putImageData(imageData, 0, 0);
		++t;
	};

	onMount(() => {
		const isReduced = matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

		if (isReduced) {
			// skip build and just show the name
			name = 'Jackson Welsh';
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
			setInterval(() => backgroundGraphics(noise3d, imageData), 15);
		}
	});
</script>

<main class="container mx-auto h-screen flex content-center flex-wrap px-2 md:px-0 transition-all">
	<canvas
		bind:this={canvas}
		id="gradient-canvas"
		class="absolute h-screen w-screen top-0 left-0 -z-40 overflow-hidden"
		data-transition-in
	/>
	<div class="w-full transition-all h-[7.5rem] sm:h-auto">
		<h1 class="dark text-6xl lg:text-6xl xl:text-8xl font-semibold font-mono text-slate-100">
			{name}{#if cursorVisible}<span class="transition-all duration-75">_</span>{/if}
		</h1>
	</div>
	{#if name === 'Jackson Welsh'}
		<div in:fade class="dark text-xl w-full transition-all">
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
				<a href="//linkedin.com/in/jacksonwelsh" target="_blank" class="text-blue-400">linkedin</a>
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
