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

	const dispatch = createEventDispatcher();
	const onFocus = () => dispatch('focus');

	const handleInput = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
		(value = (event.target as HTMLInputElement).value);

	const labelId = uuid();
</script>

<div class="my-2 w-full">
	<label for={labelId}>
		{label}
		<input
			id={labelId}
			on:input={handleInput}
			on:focus={onFocus}
			{type}
			{autocomplete}
			{name}
			{required}
			{value}
			{placeholder}
			class={[
				'w-full h-10 font-mono rounded-md p-2 focus:ring-teal-500 focus:ring-2 focus:outline-none dark:border-slate-700 dark:bg-slate-900',
				className
			].join(' ')}
		/>
	</label>
	{#if hint} <p class="mt-1 text-sm text-slate-400">{hint}</p>{/if}
</div>
