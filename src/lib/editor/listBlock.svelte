<script lang="ts">
	import type { ListData } from '$lib/types';

	export let id: string;
	export let data: ListData;
</script>

{#if data.style === 'unordered'}
	<ul class="list-disc ml-8 my-4" {id}>
		{#each data.items as item}
			<li class="my-2">{item}</li>
		{/each}
	</ul>
{:else}
	<ol class="list-decimal ml-8 my-4" {id}>
		{#each data.items as item}
			<li class="my-2">{item}</li>
		{/each}
	</ol>
{/if}
