<script>
	import Button from '$lib/button.svelte';
	import SmartCardPinPrompt from './smart-card-pin-prompt.svelte';

	let showPinPrompt = $state(false);
	let accessGranted = $state(false);
	const handleSignInClick = () => {
		console.log('clicky click');
		showPinPrompt = true;
	};

	const reset = () => {
		showPinPrompt = false;
		accessGranted = false;
	};
</script>

<div class="p-4 h-96 relative" style="contain: layout">
	{#if !accessGranted}
		<SmartCardPinPrompt
			bind:show={showPinPrompt}
			on:access-granted={() => (accessGranted = true)}
		/>
		<h2 class="text-2xl mt-0">SecuriCorp Login</h2>
		<div class="flex flex-wrap content-center justify-center h-full -mt-12">
			<p class="w-full text-center">
				Insert your smart card, then press "Sign in" to authenticate.
			</p>
			<Button on:click={handleSignInClick} size="lg" variant="primary">Sign in</Button>
		</div>
	{:else}
		<div
			class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
			</svg>
		</div>
		<h2 class="text-2xl mt-0">Access granted</h2>
		<p>You've successfully used your smart card to access SecuriCorp's online resources.</p>
		<Button on:click={reset}>Start over</Button>
	{/if}
</div>
