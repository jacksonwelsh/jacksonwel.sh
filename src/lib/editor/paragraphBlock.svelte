<script lang="ts">
	import type { ParagraphData } from '$lib/types';

	interface Props {
		id: string;
		data: ParagraphData;
	}

	let { id, data }: Props = $props();
</script>

<p {id} class="raw-text my-4">
	{@html data.text}
</p>
