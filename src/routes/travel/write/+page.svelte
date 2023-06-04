<script lang="ts">
	import EditorJS from '@editorjs/editorjs';
	import Header from '@editorjs/header';
	import Quote from '@editorjs/quote';

	const editor = new EditorJS({
		tools: {
			header: Header,
			quote: Quote
		}
	});
</script>

<main class="container mx-auto my-16">
	<h1 class="text-4xl font-bold mb-8">write something interesting</h1>
	<div id="editorjs" class="prose dark:prose-invert" />
</main>

<style>
</style>
