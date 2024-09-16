<svelte:options accessors />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { v4 as uuid } from 'uuid';

	export let label = '';
	export let name = '';
	export let hint = '';
	export let value = '';
	export let type = 'text';
	export let autocomplete = 'none';
	export let required = false;
	export let className = '';
	export let placeholder = '';
	export let disabled = false;

	const dispatch = createEventDispatcher();
	const onFocus = () => dispatch('focus');

	const handleInput = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
		(value = (event.target as HTMLInputElement).value);

	const labelId = uuid();

	let inputElement: HTMLInputElement;

	export const focus = () => {
		setTimeout(() => inputElement?.focus());
	};
</script>

<div class="my-2 w-full">
	<label for={labelId}>
		{label}
		<input
			bind:this={inputElement}
			id={labelId}
			on:input={handleInput}
			on:focus={onFocus}
			{type}
			{autocomplete}
			{name}
			{required}
			{value}
			{placeholder}
			{disabled}
			class={[
				'w-full h-10 font-mono rounded-md p-2 focus:ring-teal-500 focus:ring-2 focus:outline-none border dark:border-slate-700',
				disabled ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'dark:bg-slate-900',
				className
			].join(' ')}
		/>
	</label>
	{#if hint}
		<p class="mt-1 text-sm text-slate-400">{hint}</p>{/if}
</div>
