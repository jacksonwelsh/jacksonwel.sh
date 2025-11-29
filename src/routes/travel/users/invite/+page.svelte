<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import ControlledInput from '$lib/input.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
	const { verification } = data;

	let email = $state('');
	let name = $state('');
</script>

<main class="h-screen flex items-center justify-center">
	<div
		class="bg-gray-200 dark:bg-gray-950 w-96 p-4 rounded-md border border-gray-300 dark:border-gray-800 grid gap-4"
	>
		{#if form?.success}
			<h1 class="font-mono text-3xl font-bold">Success!</h1>
			<p class="text-lg">
				You're all set up. Head over to the <a href="/travel/login" class="underline font-bold"
					>login page</a
				> to sign in.
			</p>
		{:else if form?.success === false}
			<h1 class="font-mono text-3xl font-bold">Something went wrong.</h1>
			<p class="text-lg">
				Not sure what happened here, but your registration was rejected. Make sure your email isn't
				already associated with an account and try again.
			</p>
			<button
				class="py-1.5 w-full bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
				onclick={() => window.location.reload()}>go back</button
			>
		{:else if verification}
			<h1 class="font-mono text-3xl font-bold">Welcome!</h1>
			<p class="text-lg">You found the secret invite code 🎉</p>
			<p class="">Let's get you set up with an account – enter your name and email below.</p>
			<form method="POST">
				<ControlledInput label="Email" name="email" bind:value={email} />
				<ControlledInput label="Name" name="name" bind:value={name} />

				<button
					class="py-1.5 w-full mt-4 bg-teal-500 hover:bg-teal-400 dark:bg-teal-400/10 dark:border-2 dark:border-teal-400/50 dark:hover:bg-teal-400/25 transition rounded-lg"
					type="submit">submit</button
				>
			</form>
		{:else}
			<h1 class="font-mono text-3xl font-bold">Invalid code</h1>
			<p class="text-lg">
				Looks like the invite code you provided was not correct. Please check your invite link and
				try again.
			</p>
		{/if}
	</div>
</main>
