<script lang="ts">
	interface Props {
		[key: string]: any
	}

	let { ...props }: Props = $props();
</script>

<span
	class={props.class +
		' text-gray-500/25 dark:text-gray-400/35 font-sans drop-shadow-xl pointer-events-none'}>/</span
>
