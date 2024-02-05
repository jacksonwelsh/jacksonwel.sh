<script lang="ts">
	export let data: PageData;

	import { Passage, type PassageAppInfo } from '@passageidentity/passage-js';
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
	import type { PageData } from './$types';
	import HardwareSecurityModule from 'carbon-icons-svelte/lib/HardwareSecurityModule.svelte';
	import { onMount } from 'svelte';

	const passage = new Passage(PUBLIC_PASSAGE_APP_ID);
	let email: string = '';

	const { appInfo } = data;

	let pageState:
		| 'fresh'
		| 'nextClicked'
		| 'doLoginPasskey'
		| 'showRegisterScreen'
		| 'doRegisterPasskey'
		| 'magicLinkSent' = 'fresh';

	let magicLinkSent = false;
	const logError = (e: Error) => {
		console.error(e);
		return '';
	};

	const loginOrRegisterUser = () => {
		pageState = 'nextClicked';
		passage.identifierExists(email).then((exists) => {
			if (exists) {
				pageState = 'doLoginPasskey';
			} else {
				pageState = 'showRegisterScreen';
			}
		});
	};

	const reset = () => {
		pageState = 'fresh';
	};

	let isSignedIn = false;
	let isFirefox = false;

	onMount(() => {
		const session = passage.getCurrentSession();
		session.authGuard().then((state) => {
			isSignedIn = state;
		});

		if (navigator.userAgent.indexOf('Firefox') > 0) {
			isFirefox = true;
		}
	});

	const signOut = () => {
		passage.getCurrentSession().signOut();
		window.location.reload();
	};

	const sendMagicLink = () => {
		passage.newLoginMagicLink(email).then(() => {
			pageState = 'magicLinkSent';
		});
	};
</script>

<main class="h-screen flex items-center justify-center flex-wrap">
	{#if isFirefox}
		<div class="bg-red-600 text-white w-full absolute top-0 p-1 text-center">
			passkey support for firefox isn't great, if you're having sign in issues you can use Magic
			Links or try a different browser
		</div>
	{/if}
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
		{:else if pageState === 'fresh'}
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
		{:else if pageState === 'doLoginPasskey'}
			{#await passage.login(email)}
				<div
					class="w-48 h-48 my-6 rounded-full border border-teal-600 dark:border-teal-400 mx-auto flex items-center justify-center"
				>
					<HardwareSecurityModule size={32} class="w-24 h-24 text-teal-600 dark:text-teal-400" />
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
				{:else if e.statusCode === 403}
					<p class="my-4">Looks like you're new here. Welcome!</p>
					<p class="my-4">
						Since this is your first time signing in, I need to send a magic link to your email.
						Press the button below to send it, then click the link on device you want to sign in on.
					</p>
					<p class="my-4">
						You'll have an opportunity to register this device as an authenticator when you return.
					</p>
					<button
						class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
						on:click={sendMagicLink}>Send a magic link</button
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
		{:else if pageState === 'showRegisterScreen'}
			<h2 class="my-4 text-lg">Are you new here?</h2>
			<p class="my-4">
				I couldn't find your email in the users database. If you think you already have an account
				here, please <button class="underline font-bold" on:click={reset}>go back</button> and try using
				a different email address.
			</p>
			<p class="my-4">
				Registration for this site is <strong>private,</strong> so you'll need to contact me to get yourself
				added to the user list. Once you get your confirmation email, come back here to set up your account.
			</p>
			<div class="w-full flex items-center">
				<a
					class="py-1.5 w-full text-center bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
					href="/travel">Go home</a
				>
			</div>
		{:else if pageState === 'doRegisterPasskey'}
			{#await passage.newRegisterMagicLink(email)}
				<div
					class="w-48 h-48 my-6 rounded-full border border-teal-600 dark:border-teal-400 mx-auto flex items-center justify-center"
				>
					<HardwareSecurityModule size={32} class="w-24 h-24 text-teal-600 dark:text-teal-400" />
				</div>
				<h2 class="text-lg font-bold text-center">Sign up with your passkey</h2>
			{:then}
				<p class="my-4 text-lg">Verification email sent!</p>
				<p class="my-4">
					Click the link we just sent to your email. After clicking the link, you'll be prompted to
					create a Passkey on your device - make sure to do this on a phone or computer that belongs
					to you!
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
		{:else if pageState === 'magicLinkSent'}
			<p class="my-4 text-lg">Magic link sent!</p>
			<p class="my-4">
				Click the link we just sent to your email. After clicking the link, you can create a Passkey
				on your device - make sure to do this on a phone or computer that belongs to you!
			</p>
			<a class="" href="/travel">
				<div
					class="py-1.5 text-center w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
				>
					Go home
				</div></a
			>
		{/if}
	</div>
</main>
