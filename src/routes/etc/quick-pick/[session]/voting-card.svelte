<script lang="ts">
    export let id: string;
	export let text: string;
	export let vote: number;
    export let totalNominations: number;
</script>

<button
	class={`w-full text-left grid grid-cols-4 rounded-md px-4 py-2 my-2 ring-1 ring-inset border-black dark:ring-cyan-400/20 transition-all ${vote !== -1 ? 'bg-cyan-200 dark:bg-cyan-400/10 text-cyan-800 dark:text-cyan-400' : ''}`}
	on:click
>
	<span class="col-span-3">{text}</span>
	{#if vote !== -1}<span class="text-right font-mono font-mono-bold">{vote + 1}</span>{/if}
</button>
