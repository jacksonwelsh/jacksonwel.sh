<script lang="ts">
	import { v4 } from 'uuid';
	export let title = 'Think this was interesting?';
	export let tags: string[] = [];

	let hideClicked = false;
	const formId = v4();

	const hide = () => {
		localStorage.setItem('hideMailingListCTA', 'true');
		hideClicked = true;
	};

	let shouldShow = typeof window !== 'undefined' && !localStorage.getItem('hideMailingListCTA');
</script>

{#if shouldShow && !hideClicked}
	<hr />

	<h2>{title}</h2>
	<p>
		<slot
			>I have a mailing list that I send new blog posts out to. Drop your email in if you're
			interested.</slot
		>
	</p>
	<form
		action="https://buttondown.email/api/emails/embed-subscribe/jacksonwelsh"
		method="post"
		target="popupwindow"
		on:submit={() => window.open('https://buttondown.email/jacksonwelsh', 'popupwindow')}
		class="flex flex-col"
	>
		<div class="w-full flex flex-col">
			<label for={`${formId}bd-email`} class="w-full">Enter your email</label>
			<input
				type="email"
				name="email"
				id={`${formId}bd-email`}
				class="font-mono focus:ring-blue-600 focus:ring-2 font-mono-light dark:bg-gray-900 rounded-md dark:border-gray-700 border py-1 px-4 focus:outline-hidden"
			/>
			{#if tags.length > 0}
				<input type="hidden" name="tags" value={tags.join(',')} />
			{/if}
			<input
				type="submit"
				value="Subscribe"
				class="my-2 dark:text-blue-200 rounded-md px-4 py-1 border bg-blue-600 text-blue-50 hover:text-blue-100 border-blue-400 dark:hover:text-blue-100 hover:bg-blue-800 dark:border-blue-800 dark:bg-blue-900/25 dark:hover:bg-blue-900/50 hover:cursor-pointer transition-colors"
			/>
		</div>
	</form>
	<button on:click={hide} class="mt-4 text-xs text-gray-600 dark:text-gray-400"
		>[ don't show me this again ]</button
	>
	<hr />
{:else if hideClicked}
	<hr />
	<p>Understood! All mailing list CTAs will be hidden from blog posts for you.</p>
	<hr />
{:else}
	<hr />
{/if}
