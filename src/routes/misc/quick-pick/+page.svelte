<script lang="ts">
    import { enhance } from '$app/forms';
    import Button from '$lib/button.svelte';
</script>

<svelte:head>
    <title>QuickPick | Jackson Welsh</title>
</svelte:head>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/quick-pick
	</div>
</div>

<section class="container mx-auto flex h-screen flex-wrap content-center relative">
	<h1 class="font-bold text-6xl w-full mb-4">quick pick</h1>
    <form method="POST" use:enhance>
        <Button>create session</Button>
    </form>
</section>

