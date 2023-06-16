<script lang="ts">
	import type { QuoteData } from '$lib/types';

	export let id: string;
	export let data: QuoteData;
</script>

<figure class="my-10 border-l border-emerald-600 pl-9" {id}>
	<blockquote class="font-semibold">
		<p>{data.text}</p>
	</blockquote>
	<figcaption class="mt-6 flex gap-x-4">
		<div class="text-sm leading-6">{data.caption}</div>
	</figcaption>
</figure>
