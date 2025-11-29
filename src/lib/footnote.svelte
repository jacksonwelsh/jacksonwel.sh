<script lang="ts">
	interface Props {
		index: number;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { ...props }: Props = $props();

	const scrollBack = () => {
		const link = document.querySelector(`#footnoteLink${props.index}`);

		if (!link) {
			console.error('Failed to find footnote link');
			return;
		}

		link.scrollIntoView({ behavior: 'smooth' });

		link.classList.add('bg-yellow-200', 'dark:bg-yellow-800');
		setTimeout(() => {
			link.classList.remove('bg-yellow-200', 'dark:bg-yellow-800');
		}, 1500);
	};
</script>

<div id={`footnote${props.index}`} class={`relative mx-2 sm:mx-0 text-sm ${props.class}`}>
	<button onclick={scrollBack} class="font-bold text-teal-600 dark:text-teal-500 absolute -left-2"
		><sup>{props.index}</sup></button
	>
	{@render props.children?.()}
</div>
