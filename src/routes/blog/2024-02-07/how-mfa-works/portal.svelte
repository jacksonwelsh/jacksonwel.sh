<script lang="ts">

	import PortalLabel from './portal-label.svelte';
	interface Props {
		label: string;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { ...props }: Props = $props();
</script>

<div
	class={`relative flex items-center justify-center p-4 gap-2 rounded-md border-2 dark:border-gray-700 border-gray-300 mb-2 text-sm md:text-base ${props.class}`}
>
	<PortalLabel>{props.label}</PortalLabel>
	{@render props.children?.()}
</div>
