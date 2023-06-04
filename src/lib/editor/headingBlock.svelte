<script lang="ts">
	import type { HeaderData } from '$lib/types';

	export let id: string;
	export let data: HeaderData;

	const classes: Record<HeaderData['level'], string> = {
		1: 'text-4xl font-bold my-12',
		2: 'text-3xl font-bold mt-8 mb-4',
		3: 'text-2xl font-bold mt-6 mb-3',
		4: 'text-xl font-bold mt-4 mb-2',
		5: 'text-lg font-bold mt-3 mb-1',
		6: 'text-base font-bold mt-2 mb-1'
	};
</script>

<svelte:element this={`h${data.level}`} class={classes[data.level]} {id}>
	{data.text}
</svelte:element>
