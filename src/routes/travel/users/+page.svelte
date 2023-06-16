<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	console.log({ users: data.users });
</script>

<main class="container mx-auto my-16">
	<h1 class="text-4xl font-mono mb-6">Users</h1>
	<ul class="list-disc">
		{#each data.users.users as user}
			<li><a href={`/travel/users/${user.id}`} class="hover:underline">{user.email}</a></li>
		{/each}
	</ul>
</main>
