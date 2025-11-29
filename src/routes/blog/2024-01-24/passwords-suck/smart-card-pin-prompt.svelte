<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import ControlledInput from '$lib/input.svelte';
	import { fly, fade } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';
	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();

	const dispatch = createEventDispatcher();

	let pin = $state('');
	let errorMessage = $state('');

	const handleSubmit = () => {
		if (pin.length < 4) {
			errorMessage = 'PIN must be at least 4 characters';
		} else {
			show = false;
			setTimeout(() => dispatch('access-granted'), 250);
		}
	};
</script>

{#if show}
	<div
		class="relative z-10"
		transition:fade
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<!--
    Background backdrop, show/hide based on modal state.

    Entering: "ease-out duration-300"
      From: "opacity-0"
      To: "opacity-100"
    Leaving: "ease-in duration-200"
      From: "opacity-100"
      To: "opacity-0"
  -->
		<div
			class="fixed top-0 left-0 inset-0 bg-gray-500 dark:bg-gray-700 bg-opacity-75 transition-opacity"
		></div>

		<div class="fixed top-0 left-0 inset-0 z-10 w-full overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<!--
        Modal panel, show/hide based on modal state.

        Entering: "ease-out duration-300"
          From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          To: "opacity-100 translate-y-0 sm:scale-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100 translate-y-0 sm:scale-100"
          To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      -->
				<div
					transition:fly={{ y: 50 }}
					class="relative transform overflow-hidden rounded-lg bg-white dark:bg-black px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
				>
					<form onsubmit={preventDefault(handleSubmit)}>
						<div>
							<div
								class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 z-20"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
									/>
								</svg>
							</div>
							<div class="mt-3 text-center sm:mt-5 relative z-0">
								<h3
									class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100"
									id="modal-title"
								>
									Enter your PIN
								</h3>
								<div class="mt-2">
									<p class="text-sm text-gray-500 dark:text-gray-400">
										Enter your smart card PIN to access this website.
									</p>
								</div>
								{#if errorMessage !== ''}
									<div
										class="flex items-center rounded-md border dark:border-red-600 border-red-400 dark:bg-red-900/25 bg-red-100 dark:text-red-200 text-red-800 p-4 mb-4 z-50"
									>
										<div class="text-sm">{errorMessage}</div>
									</div>
								{/if}
								<div class="text-left">
									<ControlledInput
										bind:value={pin}
										type="password"
										className="border border-gray-300 dark:border-gray-700"
										placeholder="••••••••"
										label="PIN"
									/>
								</div>
							</div>
						</div>
						<div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
							<button
								type="submit"
								class="inline-flex w-full justify-center rounded-md bg-teal-600 dark:bg-teal-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-teal-500 dark:hover:bg-teal-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:col-start-2"
								>Sign in</button
							>
							<button
								onclick={() => (show = false)}
								type="button"
								class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-black dark:ring-gray-700 dark:hover:bg-gray-900 transition-colors dark:text-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
								>Cancel</button
							>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}
