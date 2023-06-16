<script lang="ts">
	import type { ParagraphData } from '$lib/types';

	export let id: string;
	export let data: ParagraphData;
</script>

<p {id} class="raw-text my-4">
	{@html data.text}
</p>
