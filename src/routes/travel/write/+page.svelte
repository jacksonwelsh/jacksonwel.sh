<script lang="ts">
	import EditorJS from '@editorjs/editorjs';
	import Header from '@editorjs/header';
	import Quote from '@editorjs/quote';
	import Image from '@editorjs/image';
	import List from '@editorjs/list';
	import ControlledInput from '$lib/input.svelte';
	import { v4 as uuid4 } from 'uuid';
	import { PrivacyTune } from './privacyTune';

	const postId = uuid4();

	const editor = new EditorJS({
		tools: {
			header: Header,
			quote: Quote,
			list: List,
			privacy: PrivacyTune,
			image: {
				class: Image,
				config: {
					uploader: {
						async uploadByFile(image: File) {
							const formData = new FormData();
							formData.append('image', image);
							formData.append('postId', postId);
							const result = await fetch('/travel/write/upload', {
								method: 'POST',
								body: formData
							}).then((res) => res.json());

							console.log({ result });

							return result;
						},
						async uploadByUrl(url: string) {
							return {
								success: 0
							};
						}
					},
					additionalRequestData: {
						postId
					}
				}
			}
		},
		tunes: ['privacy'],
		autofocus: true
	});

	const save = async () => {
		const output = await editor.save();
		await fetch('/travel/write/save', {
			method: 'POST',
			body: JSON.stringify({
				editorData: JSON.stringify(output),
				title,
				slug,
				postId
			})
		})
			.then((r) => {
				if (r.ok || r.status === 301) window.location.replace(`/travel/${slug}`);
				throw new Error(r.status + ' ' + r.statusText);
			})
			.catch((e) => {
				alert('something went wrong :(\n' + e.message);
				console.error(e);
			});
	};

	let title = $state('');
	let slug = $state('');
</script>

<main class="container mx-auto my-16">
	<button
		onclick={save}
		disabled={title === '' || slug === ''}
		class={`${
			title === '' || slug === ''
				? 'cursor-not-allowed bg-blue-400'
				: 'bg-blue-500 hover:bg-blue-700'
		} text-white font-bold py-2 px-4 rounded`}
	>
		Save</button
	>
	<h1 class="text-4xl font-bold mb-8">write something interesting</h1>

	<div class="container grid lg:grid-cols-2 gap-4">
		<ControlledInput label="title" bind:value={title} className="min-w-[24rem]" />
		<ControlledInput label="slug" bind:value={slug} className="min-w-[24rem]" />
	</div>

	<div id="editorjs" class="prose dark:prose-invert"></div>
</main>

<style>
</style>
