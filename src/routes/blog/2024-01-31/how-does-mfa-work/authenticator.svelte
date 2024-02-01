<script lang="ts">
	export let show = false;

	import Button from '$lib/button.svelte';
	import ControlledInput from '$lib/input.svelte';
	import { DT, alphabet, hmac } from './mfaUtils';
	import RadialProgress from './radial-progress.svelte';
	import { counter, timestamp } from './store';

	import Minimize20 from 'carbon-icons-svelte/lib/Minimize20';
	import Maximize20 from 'carbon-icons-svelte/lib/Maximize20';
	import Close20 from 'carbon-icons-svelte/lib/Close20';
	import { fly } from 'svelte/transition';

	let authenticatorDiv: HTMLDivElement;
	let minimize = false;

	let authenticatorSecret = '';
	let errorMessage = '';
	let code = '000000';
	let showInput = true;

	const saveSecret = () => {
		const formatted = authenticatorSecret.replace(/[ =]/g, '').toLowerCase();
		const invalidChars = Array.from(formatted).filter((char) => !alphabet.includes(char));

		if (invalidChars.length > 0) {
			errorMessage = `Invalid characters present in input: ${invalidChars.join(', ')}`;
			return;
		}

		showInput = false;
		errorMessage = '';
		authenticatorSecret = formatted;
	};

	$: hmac(authenticatorSecret, $counter).then((result) => {
		if (result != null) {
			code = DT(result).toString().padStart(6, '0');
		}
		return '';
	});

	let minimizeTranslationAmount = 0;

	$: {
		if (minimize) {
			minimizeTranslationAmount = authenticatorDiv.clientHeight;
		} else {
			minimizeTranslationAmount = 0;
		}
	}
</script>

{#if show}
	<div
		transition:fly={{ y: 200 }}
		class="fixed bottom-0 right-0 w-full md:w-96 md:rounded-tl-md border-t-2 md:border-l-2 dark:border-gray-700 border-gray-300 bg-white dark:bg-black z-50 transition-transform"
		style={`transform: translate(0, ${minimizeTranslationAmount}px)`}
	>
		<div
			class="relative bg-gray-100 dark:bg-gray-900 text-center text-sm py-0.5 font-medium text-gray-600/75 dark:text-gray-400/50 tracking-wide"
		>
			<span>Authenticator</span>
			<div class="absolute right-0.5 top-0 flex gap-2 p-0.5">
				<button
					class="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors hover:cursor-pointer"
					on:click={() => (minimize = !minimize)}
				>
					{#if minimize}
						<Maximize20 class="p-0.5" />
					{:else}
						<Minimize20 class="p-0.5" />
					{/if}
				</button>
				<button on:click={() => (show = false)} class="hover:cursor-pointer">
					<Close20
						class="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
					/>
				</button>
			</div>
		</div>
		<div class="p-4" bind:this={authenticatorDiv}>
			{#if showInput}
				<form on:submit|preventDefault={saveSecret}>
					{#if errorMessage !== ''}
						<div class="text-red-500">{errorMessage}</div>
					{/if}
					<ControlledInput
						bind:value={authenticatorSecret}
						label="paste secret key here"
						className="bg-gray-100 dark:bg-gray-900"
					/>
					<Button type="submit">save</Button>
				</form>
			{:else}
				<div class="flex items-center gap-4">
					<span class="text-xl font-mono">{code}</span>
					<RadialProgress
						class="h-10 w-10"
						timeRemaining={30 - (Math.floor($timestamp / 10) % 30)}
					/>
				</div>
				<Button variant="text" on:click={() => (showInput = true)} class="-ml-3">Edit secret</Button
				>
			{/if}
		</div>
	</div>
{/if}
