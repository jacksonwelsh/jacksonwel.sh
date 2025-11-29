<!-- @migration task: review uses of `navigating` -->
<script lang="ts">
	import { fade } from 'svelte/transition';

	import { navigating } from '$app/state';
	import PageLoader from '$lib/transition.svelte';
	import '../app.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

{#if navigating.to || navigating.from}
	<div out:fade={{ delay: 500 }}>
		<PageLoader />
	</div>
{/if}

{@render children?.()}
