<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	class="absolute select-none top-0 left-0 rounded-tl-sm text-xs px-1 py-0.5 bg-gray-300/50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
>
	{@render children?.()}
</div>
