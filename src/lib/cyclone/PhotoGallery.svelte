<script lang="ts">
	import type { Photo } from './types';

	let { photos }: { photos: Photo[] } = $props();
	let current = $state<number | undefined>();
	let dialog: HTMLDialogElement;
	let activePhoto = $derived(current === undefined ? undefined : photos[current]);

	function open(index: number) {
		current = index;
		requestAnimationFrame(() => dialog.showModal());
	}

	function close() {
		dialog.close();
		current = undefined;
	}

	function previous() {
		if (current === undefined) return;
		current = (current - 1 + photos.length) % photos.length;
	}

	function next() {
		if (current === undefined) return;
		current = (current + 1) % photos.length;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') previous();
		if (event.key === 'ArrowRight') next();
	}
</script>

<section class="mb-14" aria-label="Activity photos">
	<div class="grid grid-cols-2 gap-1.5 sm:auto-rows-[17rem] sm:grid-cols-12">
		{#each photos as photo, index (photo.id)}
			<button
				type="button"
				class="group relative aspect-square overflow-hidden bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:aspect-auto"
				class:col-span-2={photos.length === 1}
				class:sm:col-span-12={photos.length === 1}
				class:sm:col-span-7={photos.length > 1 && index === 0}
				class:sm:col-span-5={photos.length > 1 && index !== 0}
				class:sm:row-span-2={photos.length === 3 && index === 0}
				class:sm:col-span-6={photos.length > 3}
				onclick={() => open(index)}
				aria-label={`Open photo ${index + 1} of ${photos.length}`}
			>
				<img
					src={photo.thumbnail_url ?? photo.feed_url}
					alt=""
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
					loading={index ? 'lazy' : 'eager'}
				/>
				<span
					class="absolute bottom-2 right-2 bg-black/55 px-2 py-1 font-mono text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
				>
					view
				</span>
			</button>
		{/each}
	</div>
</section>

<dialog
	bind:this={dialog}
	class="m-auto h-dvh w-dvw max-h-none max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
	aria-label="Photo viewer"
	onclose={() => (current = undefined)}
	onkeydown={handleKeydown}
	onclick={(event) => {
		if (event.target === dialog) close();
	}}
>
	{#if activePhoto?.feed_url}
		<div class="grid h-full grid-rows-[auto_1fr_auto] p-3 sm:p-6">
			<div class="flex items-center justify-between gap-4">
				<p class="font-mono text-xs text-white/65" aria-live="polite">
					photo {(current ?? 0) + 1} of {photos.length}
				</p>
				<button type="button" class="p-2 text-sm hover:underline" onclick={close}>close</button>
			</div>

			<div class="flex min-h-0 items-center justify-center py-3">
				<img
					src={activePhoto.feed_url}
					alt={`Activity photo ${(current ?? 0) + 1} of ${photos.length}`}
					class="max-h-full max-w-full object-contain"
				/>
			</div>

			<div class="flex items-center justify-between">
				{#if photos.length > 1}
					<button type="button" class="p-2 text-sm hover:underline" onclick={previous}
						>← previous</button
					>
					<button type="button" class="p-2 text-sm hover:underline" onclick={next}>next →</button>
				{:else}
					<span></span>
				{/if}
			</div>
		</div>
	{/if}
</dialog>
