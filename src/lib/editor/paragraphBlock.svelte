<script lang="ts">
	import type { ParagraphData } from '$lib/types';

	export let id: string;
	export let data: ParagraphData;
</script>

<p {id}>
	{data.text}
</p>
