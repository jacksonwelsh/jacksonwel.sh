<script lang="ts">
	import { enhance } from '$app/forms';
	import ControlledInput from '$lib/input.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { user } = data;

	let name = $state(user.user_metadata?.name ?? '');
	console.log({ name });
</script>

<main class="container mx-auto my-16">
	<div class="mb-6">
		<h1 class="text-4xl font-mono">
			update {user.email} ({user.user_metadata?.name ?? 'no name'})
		</h1>
		<h2 class="font-mono text-gray-500 dark:text-gray-400">
			{user.id}
		</h2>
	</div>

	<form method="POST" use:enhance>
		<ControlledInput name="name" label="name" bind:value={name} className="mb-4" />
		<button type="submit">submit</button>
	</form>
</main>
