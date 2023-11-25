<script lang="ts">
	import { fade } from 'svelte/transition';

	import { navigating } from '$app/stores';
	import PageLoader from '$lib/transition.svelte';
	import '../app.css';
</script>

{#if $navigating != null}
	<div out:fade={{ delay: 500 }}>
		<PageLoader />
	</div>
{/if}

<slot />
