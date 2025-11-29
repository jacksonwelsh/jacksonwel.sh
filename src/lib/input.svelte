<svelte:options />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { v4 as uuid } from 'uuid';

	interface Props {
		label?: string;
		name?: string;
		hint?: string;
		value?: string;
		type?: string;
		autocomplete?: string;
		required?: boolean;
		className?: string;
		placeholder?: string;
		inputmode?: 'text' | 'numeric' | 'decimal' | null;
		disabled?: boolean;
		pattern?: string | null;
	}

	let {
		label = '',
		name = '',
		hint = '',
		value = $bindable(''),
		type = 'text',
		autocomplete = 'none',
		required = false,
		className = '',
		placeholder = '',
		inputmode = null,
		disabled = false,
		pattern = null
	}: Props = $props();

	const dispatch = createEventDispatcher();
	const onFocus = () => dispatch('focus');

	const handleInput = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
		(value = (event.target as HTMLInputElement).value);

	const labelId = uuid();

	let inputElement: HTMLInputElement = $state();

	export const focus = () => {
		setTimeout(() => {
			inputElement?.focus();
		});

		if (inputElement == document.activeElement) {
			return;
		}
		inputElement?.focus();
	};

	export {
		label,
		name,
		hint,
		value,
		type,
		autocomplete,
		required,
		className,
		placeholder,
		inputmode,
		disabled,
		pattern,
	}
</script>

<div class="my-2 w-full">
	<label for={labelId}>
		{label}
		<input
			bind:this={inputElement}
			id={labelId}
			oninput={handleInput}
			onfocus={onFocus}
			{type}
			{autocomplete}
			{name}
			{required}
			{value}
			{placeholder}
			{disabled}
			{inputmode}
			{pattern}
			class={[
				'w-full h-10 font-mono rounded-md p-2 focus:ring-teal-500 focus:ring-2 focus:outline-hidden border disabled:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800! disabled:bg-slate-100 disabled:cursor-not-allowed',
				className
			].join(' ')}
		/>
	</label>
	{#if hint}
		<p class="mt-1 text-sm text-slate-400">{hint}</p>{/if}
</div>
