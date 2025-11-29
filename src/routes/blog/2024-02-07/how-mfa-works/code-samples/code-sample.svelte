<script lang="ts">

	import { Highlight } from 'svelte-highlight';
	import { typescript } from 'svelte-highlight/languages';
	import github from 'svelte-highlight/styles/github';
	import githubDark from 'svelte-highlight/styles/github-dark';
	import { isDarkTheme } from '../../../../../stores/theme';
	interface Props {
		code: string;
	}

	let { code }: Props = $props();

	let activeTheme = $derived($isDarkTheme ? githubDark : github);
</script>

<svelte:head>
	{@html activeTheme}
</svelte:head>

<Highlight class="w-full font-mono-normal -my-1 not-prose px-0" language={typescript} {code} />
