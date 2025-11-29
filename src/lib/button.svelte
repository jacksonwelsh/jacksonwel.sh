<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let variant: 'primary' | 'danger' | 'secondary' | 'filled' | 'outline' | 'text' =
		'primary';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let kind: 'a' | 'button' = 'button';
	export let href: string = '';
	export let disabled: boolean = false;

	const variantStyles = {
		primary:
			'rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-cyan-400/10 dark:text-cyan-400 dark:ring-1 dark:ring-inset dark:ring-cyan-400/20 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300 dark:hover:ring-cyan-300',
		danger:
			'rounded-full bg-red-900 text-white hover:bg-red-700 dark:bg-red-400/10 dark:text-red-400 dark:ring-1 dark:ring-inset dark:ring-red-400/20 dark:hover:bg-red-400/10 dark:hover:text-red-300 dark:hover:ring-red-300',
		secondary:
			'rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 ring-1 ring-inset dark:ring-zinc-800 ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-300',
		filled:
			'rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-cyan-500 dark:text-white dark:hover:bg-cyan-400',
		outline:
			'rounded-full text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-400 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-white',
		text: 'text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-500'
	};

	const sizeStyles = {
		sm: 'text-xs py-0.5 px-2',
		md: 'text-sm py-1 px-3',
		lg: 'text-lg py-1.5 px-4',
		xl: 'text-lg py-2 px-5'
	};

	const coreClasses =
		'inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition';
</script>

{#if kind === 'button'}
	<button
		on:click
		class="{variantStyles[variant]} {sizeStyles[size]} {coreClasses} {$$props.class} {$$props.type}"
		{disabled}
	>
		<slot />
	</button>
{:else}
	<a
		on:click
		{href}
		class="{variantStyles[variant]} {sizeStyles[size]} {coreClasses} {$$props.class}"
	>
		<slot />
	</a>
{/if}
