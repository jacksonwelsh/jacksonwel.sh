<script lang="ts">
	interface Props {
		titles: string[];
		disabled?: boolean;
		// The confirmed selection (a title from the pool), or '' when nothing valid is chosen.
		value?: string;
		// Called when the user picks a suggestion via Enter/click (lets the parent auto-submit).
		onpick?: (title: string) => void;
	}

	let { titles, disabled = false, value = $bindable(''), onpick }: Props = $props();

	let query = $state('');
	let open = $state(false);
	let activeIndex = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();

	const MAX_SUGGESTIONS = 8;

	const matches = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return titles.filter((t) => t.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS);
	});

	function onInput(e: Event) {
		query = (e.target as HTMLInputElement).value;
		// Typing invalidates any prior confirmed selection until they pick again.
		value = '';
		open = true;
		activeIndex = 0;
	}

	function select(title: string) {
		value = title;
		query = title;
		open = false;
		onpick?.(title);
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
			open = true;
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, matches.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		} else if (e.key === 'Enter') {
			if (open && matches[activeIndex]) {
				e.preventDefault();
				select(matches[activeIndex]);
			}
		} else if (e.key === 'Escape') {
			open = false;
		}
	}

	export const focus = () => inputEl?.focus();
	export const clear = () => {
		query = '';
		value = '';
		open = false;
	};
</script>

<div class="relative w-full sm:w-[32rem] mx-auto my-2">
	<input
		bind:this={inputEl}
		type="text"
		role="combobox"
		aria-controls="betdle-suggestions"
		aria-expanded={open}
		aria-autocomplete="list"
		autocomplete="off"
		autocapitalize="off"
		spellcheck="false"
		{disabled}
		placeholder="Guess the market…"
		value={query}
		oninput={onInput}
		onkeydown={onKeydown}
		onfocus={() => (open = matches.length > 0)}
		onblur={() => setTimeout(() => (open = false), 120)}
		class="w-full h-10 font-mono rounded-md p-2 focus:ring-teal-500 focus:ring-2 focus:outline-hidden border disabled:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800! disabled:bg-slate-100 disabled:cursor-not-allowed"
	/>

	{#if open && matches.length}
		<ul
			id="betdle-suggestions"
			role="listbox"
			class="absolute z-10 mt-1 w-full max-h-72 overflow-auto rounded-md border border-slate-200 bg-white text-left shadow-lg dark:border-slate-700 dark:bg-slate-900"
		>
			{#each matches as match, i}
				<li role="option" aria-selected={i === activeIndex}>
					<button
						type="button"
						onmousedown={(e) => {
							e.preventDefault();
							select(match);
						}}
						onmouseenter={() => (activeIndex = i)}
						class="block w-full px-3 py-2 text-left text-sm font-mono {i === activeIndex
							? 'bg-teal-50 dark:bg-teal-900/40'
							: ''} hover:bg-teal-50 dark:hover:bg-teal-900/40"
					>
						{match}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
