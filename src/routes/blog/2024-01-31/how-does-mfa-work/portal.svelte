<script lang="ts">
	export let label: string;

	import PortalLabel from './portal-label.svelte';
</script>

<div
	class={`relative flex items-center justify-center p-4 gap-2 rounded-md border-2 dark:border-gray-700 border-gray-300 mb-2 text-sm sm:text-sm md:text-base ${$$props.class}`}
>
	<PortalLabel>{label}</PortalLabel>
	<slot />
</div>
