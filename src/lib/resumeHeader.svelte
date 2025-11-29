<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<h2
	class="font-mono-semibold text-teal-800 dark:text-teal-300 font-mono text-xl mt-6 mb-3 print:mt-2 print:mb-1"
>
	{@render children?.()}
</h2>
