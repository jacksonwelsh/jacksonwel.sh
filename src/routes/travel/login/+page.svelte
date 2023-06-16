<script lang="ts">
	export let data: PageData;

	import { Passage, type PassageAppInfo } from '@passageidentity/passage-js';
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
	import type { PageData } from './$types';
	import HardwareSecurityModule32 from 'carbon-icons-svelte/lib/HardwareSecurityModule32';
	import { onMount } from 'svelte';

	const passage = new Passage(PUBLIC_PASSAGE_APP_ID);
	let email: string = '';

	const { appInfo } = data;

	let nextClicked = false;
	let doLoginPasskey = false;
	let showRegisterScreen = false;
	let doRegisterPasskey = false;
	let magicLinkSent = false;
	const logError = (e: Error) => {
		console.error(e);
		return '';
	};

	const loginOrRegisterUser = () => {
		nextClicked = true;
		passage.identifierExists(email).then((exists) => {
			if (exists) {
				doLoginPasskey = true;
			} else {
				showRegisterScreen = true;
			}
		});
	};

	const reset = () => {
		nextClicked = false;
		doLoginPasskey = false;
		showRegisterScreen = false;
		doRegisterPasskey = false;
	};

	let isSignedIn = false;

	onMount(() => {
		const session = passage.getCurrentSession();
		session.authGuard().then((state) => {
			isSignedIn = state;
		});
	});

	const signOut = () => {
		passage.getCurrentSession().signOut();
		window.location.reload();
	};

	const sendMagicLink = () => {
		passage.newLoginMagicLink(email).then(() => {
			magicLinkSent = true;
		});
	};
</script>

<main class="h-screen flex items-center justify-center">
	<div
		class="bg-gray-200 dark:bg-gray-950 w-96 p-4 rounded-md border border-gray-300 dark:border-gray-800"
	>
		<h1 class="font-mono text-3xl font-bold">Sign in</h1>

		{#if isSignedIn}
			<h2 class="text-lg my-4">Looks like you're already signed in.</h2>
			<p class="my-4">You can sign out, or return to the blog's homepage.</p>
			<div class="grid gap-2">
				<a
					class="py-1.5 w-full text-center bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
					href="/travel">Go home</a
				>
				<button
					class="py-1.5 w-full bg-gray-900 hover:bg-gray-800 text-gray-50 dark:bg-gray-400/10 dark:border-2 dark:border-gray-400/50 dark:hover:bg-gray-400/25 transition rounded-lg"
					on:click={signOut}>Sign out</button
				>
			</div>
		{:else if !nextClicked}
			<form on:submit={loginOrRegisterUser}>
				<input
					class="my-4 dark:bg-gray-900 border dark:border-gray-800 h-12 w-full rounded-md p-2 focus:outline-none focus:ring focus:ring-teal-600/50 shadow-inner"
					type="email"
					placeholder="Email address"
					required
					bind:value={email}
				/>
				<div class="flex flex-wrap items-center justify-center gap-2">
					<button
						type="submit"
						class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
						>Next</button
					>
				</div>
			</form>
		{:else if doLoginPasskey}
			{#await passage.login(email)}
				<div
					class="w-48 h-48 my-6 rounded-full border border-teal-600 dark:border-teal-400 mx-auto flex items-center justify-center"
				>
					<HardwareSecurityModule32 class="w-24 h-24 text-teal-600 dark:text-teal-400" />
				</div>
				<h2 class="text-lg font-bold text-center">Sign in with your passkey</h2>
			{:then}
				<p class="my-4">Successfully signed in!</p>
				<a class="" href="/travel">
					<div
						class="py-1.5 text-center w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
					>
						Go home
					</div></a
				>
			{:catch e}
				{#if e.statusCode === 404}
					<p class="my-4">Couldn't find a user with that email address, please try again.</p>
					<button
						class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
						on:click={reset}>Go back</button
					>
				{:else if e.statusCode === 400}
					<p class="my-4">Please enter a valid email address.</p>
					<button
						class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
						on:click={reset}>Go back</button
					>
				{:else if !magicLinkSent}
					<p class="my-4">
						Something didn't go quite right there, please try again or click the button below to get
						a magic link in your email.
					</p>
					<div class="grid gap-2">
						<button
							class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
							on:click={sendMagicLink}>Send a magic link</button
						>
						<button
							class="py-1.5 w-full bg-gray-900 hover:bg-gray-800 text-gray-50 dark:bg-gray-400/10 dark:border-2 dark:border-gray-400/50 dark:hover:bg-gray-400/25 transition rounded-lg"
							on:click={reset}>Go back</button
						>
					</div>
				{:else}
					<p class="my-4 text-lg">Sent!</p>
					<p class="my-4">
						Click the link in your email to sign in. Make sure to do this from the device you want
						to sign in from.
					</p>
				{/if}
			{/await}
		{:else if showRegisterScreen}
			{#if !doRegisterPasskey}
				<h2 class="my-4 text-lg">Welcome!</h2>
				<p class="my-4">
					Looks like you're new here. If you're not, please <button
						class="underline font-bold"
						on:click={reset}>go back</button
					> and try using a different email address.
				</p>
				<p class="my-4">
					<strong>Sign-in for this site is different from many others!</strong> I'm using a
					technology called <strong>passkeys</strong> to remove the need for passwords here. Your passkey
					is stored on the device you created it on (and if you're using Safari, it'll sync across all
					your devices using Safari). You can also sign in with a magic link if you're on a new device.
				</p>
				<p class="my-4">
					When you press "register," you'll verify your email then create a passkey for this site.
				</p>
				<button
					class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
					on:click={() => (doRegisterPasskey = true)}>Register</button
				>
			{:else}
				{#await passage.newRegisterMagicLink(email)}
					<div
						class="w-48 h-48 my-6 rounded-full border border-teal-600 dark:border-teal-400 mx-auto flex items-center justify-center"
					>
						<HardwareSecurityModule32 class="w-24 h-24 text-teal-600 dark:text-teal-400" />
					</div>
					<h2 class="text-lg font-bold text-center">Sign up with your passkey</h2>
				{:then}
					<p class="my-4 text-lg">Verification email sent!</p>
					<p class="my-4">
						Click the link we just sent to your email. After clicking the link, you'll be prompted
						to create a Passkey on your device - make sure to do this on a phone or computer that
						belongs to you!
					</p>
					<a class="" href="/travel">
						<div
							class="py-1.5 text-center w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
						>
							Go home
						</div></a
					>
				{:catch e}
					{#if e.statusCode === 404}
						<p class="my-4">Couldn't find a user with that email address, please try again.</p>
						<button
							class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
							on:click={reset}>Go back</button
						>
					{:else if e.statusCode === 400}
						<p class="my-4">Please enter a valid email address.</p>
						<button
							class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
							on:click={reset}>Go back</button
						>
					{:else}
						<p class="my-4">Something didn't go quite right there, please try again.</p>
						{logError(e)}
						<button
							class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
							on:click={reset}>Go back</button
						>
					{/if}
				{/await}
			{/if}
		{/if}
	</div>
</main>
