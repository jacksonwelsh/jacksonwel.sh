<script lang="ts">
	import { Passage } from '@passageidentity/passage-js';
	import { fade } from 'svelte/transition';

	import { navigating } from '$app/stores';
	import PageLoader from '$lib/transition.svelte';
	import '../app.css';
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
	import { onMount } from 'svelte';
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	const passage = new Passage(PUBLIC_PASSAGE_APP_ID);

	const refreshLogin = async () => {
		const session = passage.getCurrentSession();
		await session.getAuthToken().catch((e) => {
			console.error(e);
		});
		console.debug('refreshed or fetched token');
	};

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		console.log({ urlParams });
		const magicLink = urlParams.get('psg_magic_link');
		if (magicLink && window.location.pathname !== '/travel/login/magic') {
			console.log('Found magic link!');
			goto('/travel/login/magic?psg_magic_link=' + magicLink);
		} else {
			await refreshLogin();
			setInterval(refreshLogin, 10000);
		}
	});
</script>

{#if $navigating != null}
	<div out:fade={{ delay: 500 }}>
		<PageLoader />
	</div>
{/if}

<slot />
