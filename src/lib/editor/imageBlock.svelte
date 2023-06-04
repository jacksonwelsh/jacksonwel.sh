<script lang="ts">
	import type { ImageData } from '$lib/types';

	export let id: string;
	export let data: ImageData;
</script>

<figure {id} class="my-8 w-full flex flex-wrap justify-center">
	<img src={data.file.url} alt={data.caption} class="" />
	<figcaption class="text-sm text-gray-400 dark:text-gray-500 text-center w-full">
		{data.caption}
	</figcaption>
</figure>
