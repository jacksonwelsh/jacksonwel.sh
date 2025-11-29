<script lang="ts">
	interface Props {
		index: number;
	}

	let { index }: Props = $props();

	const scrollTo = () => {
		const footnote = document.querySelector(`#footnote${index}`);
		if (!footnote) {
			console.error('Failed to find footnote.');
			return;
		}

		footnote.scrollIntoView({ behavior: 'smooth' });
	};
</script>

<button
	id={`footnoteLink${index}`}
	onclick={scrollTo}
	class="font-bold text-teal-600 dark:text-teal-500 transition-colors"><sup>{index}</sup></button
>
