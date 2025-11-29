<script lang="ts">
	import { enhance } from '$app/forms';
	import ControlledInput from '$lib/input.svelte';

	let email = $state('');
</script>

<main class="container mx-auto my-16">
	<h1 class="text-4xl font-mono mb-6">Add a new user</h1>
	<form method="POST" use:enhance>
		<ControlledInput
			label="Email"
			type="email"
			className="mb-4"
			name="email"
			autocomplete="email"
			bind:value={email}
		/>
		<ControlledInput
			label="Name"
			type="text"
			className="mb-4"
			name="name"
			autocomplete="given-name"
			bind:value={email}
		/>
		<button type="submit">submit</button>
	</form>
</main>
