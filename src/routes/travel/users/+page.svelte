<script lang="ts">
	import type { PageData } from './$types';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	console.log({ users: data.users });
</script>

<main class="container mx-auto my-16">
	<h1 class="text-4xl font-mono mb-6">Users</h1>
	<div class="my-4">
		<a
			class="py-1 px-2 rounded-md bg-teal-500/10 hover:bg-teal-500/25 border border-teal-500 text-teal-500 hover:text-teal-50"
			href="/travel/users/new">add new</a
		>
	</div>
	<ul class="list-disc">
		{#each data.users.users as user}
			<li><a href={`/travel/users/${user.id}`} class="hover:underline">{user.email}</a></li>
		{/each}
	</ul>
</main>
