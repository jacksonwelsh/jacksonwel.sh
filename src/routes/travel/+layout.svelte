<script lang="ts">
	import { navigating } from '$app/stores';
</script>

<div>
	{#if false}
		<nav
			class={`w-screen h-12 bg-gray-200/50 dark:bg-gray-950/50 flex items-center border-b ${
				$navigating == null ? 'border-gray-700' : 'border-teal-500'
			} fixed top-0 -z-10 transition ease-out duration-300`}
		>
			<a href="/" class="container mx-auto flex items-center text-lg font-mono">jackson welsh</a>
		</nav>
	{/if}
	<slot />
</div>
