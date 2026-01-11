<script lang="ts">
    import { enhance } from '$app/forms';
    import Button from '$lib/button.svelte';
	import Input from '$lib/input.svelte';

    let mode = $state<'default' | 'movie'>('default');
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
    <form method="POST" use:enhance action="?/create" class="w-full">
        <fieldset class="mb-4">
            <legend class="block text-sm font-medium mb-2">Mode</legend>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode" value="default" bind:group={mode} class="accent-cyan-500" />
                    <span>Default</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode" value="movie" bind:group={mode} class="accent-cyan-500" />
                    <span>Movie</span>
                </label>
            </div>
        </fieldset>
        <Button>create session</Button>
    </form>

    <hr />
    <br />

    <form method="POST" use:enhance action="?/join" class="w-full mt-8">
        <Input label="session id" name="sid" />
        <Button>join session</Button>
    </form>
</section>

