<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
	import { Passage } from '@passageidentity/passage-js';
	import HardwareSecurityModule32 from 'carbon-icons-svelte/lib/HardwareSecurityModule32';

	const urlParams = new URLSearchParams(window.location.search);
	console.log({ urlParams });
	const magicLink = urlParams.get('psg_magic_link');
	console.log({ magicLink });

	if (!magicLink) {
		goto('/travel/login');
		throw Error('No magic link found');
	}

	let pageState:
		| 'prompt'
		| 'validating'
		| 'addingDevice'
		| 'signInInterstitial'
		| 'magicLinkValidationError' = 'prompt';

	const passage = new Passage(PUBLIC_PASSAGE_APP_ID);

	// check the magic link
	// passage.getMagicLinkStatus(magicLink).catch((e) => {
	// 	pageState = 'magicLinkValidationError';
	// 	console.error(e);
	// });

	const justSignIn = () => {
		pageState = 'validating';
		passage
			.magicLinkActivate(magicLink)
			.then(() => {
				pageState = 'signInInterstitial';
				setTimeout(() => {
					goto('/travel');
				}, 5000);
			})
			.catch((error) => {
				console.error(error);
				console.log('bruh');
				pageState = 'magicLinkValidationError';
			});
	};

	const addDeviceAndSignIn = () => {
		pageState = 'addingDevice';
		passage
			.magicLinkActivateWebAuthnNewDevice(magicLink)
			.then(() => {
				pageState = 'signInInterstitial';
				setTimeout(() => {
					goto('/travel');
				}, 5000);
			})
			.catch((error) => {
				console.error(error);
				pageState = 'magicLinkValidationError';
			});
	};
</script>

<main class="h-screen flex items-center justify-center">
	<div
		class="bg-gray-200 dark:bg-gray-950 w-96 p-4 rounded-md border border-gray-300 dark:border-gray-800 grid gap-4"
	>
		{#if pageState === 'prompt'}
			<h1 class="font-mono text-3xl font-bold">Just like magic</h1>
			<p class="text-lg">Found your magic link 😎</p>
			<p class="">Let's get you signed in. First, a decision:</p>
			<button
				class="py-1.5 w-full text-center bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
				on:click={addDeviceAndSignIn}>Add this device to my account</button
			>
			<button
				class="py-1.5 w-full bg-gray-900 hover:bg-gray-800 text-gray-50 dark:bg-gray-400/10 dark:border-2 dark:border-gray-400/50 dark:hover:bg-gray-400/25 transition rounded-lg"
				on:click={justSignIn}>Just sign me in</button
			>
		{:else if pageState === 'validating'}
			<h1 class="font-mono text-3xl font-bold">Just like magic</h1>
			<p class="text-lg">Validating your magic link...</p>
		{:else if pageState === 'addingDevice'}
			<h1 class="font-mono text-3xl font-bold">Add your device</h1>
			<div
				class="w-48 h-48 my-6 rounded-full border border-teal-600 dark:border-teal-400 mx-auto flex items-center justify-center"
			>
				<HardwareSecurityModule32 class="w-24 h-24 text-teal-600 dark:text-teal-400" />
			</div>
			<h2 class="text-lg font-bold text-center">Register this device with a passkey</h2>
		{:else if pageState === 'signInInterstitial'}
			<h1 class="font-mono text-3xl font-bold">Just like magic</h1>
			<p class="text-lg">You're good to go! ✨</p>
			<p class="">You'll be redirected to the main blog page in 5 seconds.</p>
			<a
				class="py-1.5 w-full text-center bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
				href="/travel">Go home</a
			>
		{:else if pageState === 'magicLinkValidationError'}
			<h1 class="font-mono text-3xl font-bold">ok, maybe not <em>just</em> like magic</h1>
			<p class="text-lg">Something went wrong trying to validate your magic link.</p>
			<p class="">
				Magic links expire 5 minutes after they're sent. You can request a new one on the login
				page.
			</p>
			<a
				class="py-1.5 w-full text-center bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
				href="/travel/login">Login page</a
			>
		{/if}
	</div>
</main>
