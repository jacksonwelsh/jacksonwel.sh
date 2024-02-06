<script lang="ts">
	export let index: number;

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
	on:click={scrollTo}
	class="font-bold text-teal-600 dark:text-teal-500 transition-colors"><sup>{index}</sup></button
>
