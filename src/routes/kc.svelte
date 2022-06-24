<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ params, fetch }) {
		const responseCount = await fetch('https://forms.jacksonwelsh.workers.dev/ck/participants', {
			method: 'GET'
		})
			.then((r) => r.json())
			.then((r) => r.participants);

		const acceptingResponses = responseCount < 20;

		return {
			props: { id: params.id, acceptingResponses, responseCount }
		};
	}
</script>

<script>
	import Divider from '$lib/divider.svelte';
	import ChevronRight16 from 'carbon-icons-svelte/lib/ChevronRight16';
	import Input from '$lib/input.svelte';
	import TextArea from '$lib/textarea.svelte';

	export let acceptingResponses;
	export let responseCount;
	let name = '';
	let discord = '';
	let food = '';
	let submitStatus = false;

	const submit = async () => {
		if (name.trim() === '') {
			alert('name cannot be empty');
			return;
		} else if (discord.trim() === '') {
			alert('discord cannot be empty');
			return;
		}

		await fetch('https://forms.jacksonwelsh.workers.dev/ck/submit', {
			method: 'POST',
			body: JSON.stringify({
				name,
				discord,
				food
			})
		})
			.then(async (r) => {
				if (r.ok) {
					return r.json();
				} else {
					console.log({ r });
					if (r.status === 507) alert('sorry, too many respondants already :/');
					else if (r.status === 400) alert('something looks wrong with your input...');
					throw Error('bruh');
				}
			})
			.then(() => {
				submitStatus = true;
				++responseCount;
			});

		return false;
	};
</script>

<div class="mx-auto text-center mt-3 text-slate-400 print:hidden flex items-center justify-center">
	<a href="/">home</a>
	<ChevronRight16 /> form
</div>
<main class="container mx-auto px-2 md:px-0 print:text-sm">
	<h1 class="text-6xl font-bold mt-6 mb-2 font-mono text-center overflow-x-hidden">Cookout<br class="block sm:hidden" />/Kickback</h1>
	<h2 class="font-light font-mono text-teal-800 dark:text-teal-100 text-center my-2">
		Friday, June 24 <Divider /> 7:30 PM <Divider />
    See Discord event for the address (Cap Hill)
    <Divider />
		<span class="font-bold text-red-700 dark:text-red-300">{12 - responseCount} spots remain</span>
	</h2>

	<h2 class="font-bold mt-8 text-4xl text-center">Please sign up to attend.</h2>

	{#if acceptingResponses && !submitStatus}
		<div
			class="w-full md:w-2/3 xl:w-3/5 dark:bg-slate-800 bg-slate-200 px-6 py-4 rounded-xl shadow-md mx-auto my-12"
		>
			<form class="flex justify-center flex-wrap">
				<div class="w-full flex justify-center">
					<Input label="your name" bind:value={name} />
				</div>
				<div class="w-full flex justify-center">
					<Input
						label="discord @"
						hint="bonus points for including the #numbers"
						bind:value={discord}
					/>
				</div>
				<div class="w-full flex justify-center">
					<TextArea
						label="bringing snacks or drinks? lmk what you're bringing!"
						bind:value={food}
					/>
				</div>
				<button on:click|preventDefault={() => submit()} class="bg-teal-500 w-full rounded-lg h-8"
					>submit</button
				>
			</form>
		</div>
	{:else if submitStatus}
		<h3 class="text-center text-2xl font-bold text-teal-500 my-4">Received, thanks!</h3>
	{:else}
		<h3 class="text-center text-2xl font-bold text-red-500 my-4">
			Sorry, the list has filled up :/
		</h3>
	{/if}
</main>
