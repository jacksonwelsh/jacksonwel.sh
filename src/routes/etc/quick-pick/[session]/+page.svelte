<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Input from '$lib/input.svelte';
	import Button from '$lib/button.svelte';
	import VotingCard from './voting-card.svelte';
	import MovieAutocomplete from './movie-autocomplete.svelte';
	import type { MovieMetadata, Nomination } from '../workers';
	import { countryCodeToFlag } from '../utils';

	interface Props {
		form: { success?: boolean } | null;
		data: PageData;
	}

	let { form, data }: Props = $props();

	let selectedMovie = $state<MovieMetadata | null>(null);

	let session = $state(data.session);
    let votedUsers = $state(data.votedUsers);
    let connected = $state(false);
    let eventSource: EventSource;
    let reconnectAttempts = 0;

    const debounce = (func: Function) => {
        const delay = Math.min(2 ** reconnectAttempts / 2, 64);
        console.log(`waiting ${delay} seconds before reconnecting`);
        reconnectAttempts += 1;

        setTimeout(func, delay * 1000);
    }

    const connect = () => {
        eventSource = new EventSource(`/etc/quick-pick/${session.id}/stream`);

        eventSource.onmessage = (event) => {
            const eventData = JSON.parse(event.data);
            session = eventData.session;
            votedUsers = eventData.votedUsers;
            connected = true;
            reconnectAttempts = 0;
        };

        eventSource.onerror = () => {
            eventSource.close();
            connected = false;
            debounce(connect);
        };
    }

	onMount(() => {
        connect();
		return () => {
            if (eventSource.readyState == EventSource.OPEN) {
                eventSource.close();
            }
            connected = false;
        }
	});

	let votes: string[] = $state([]);
	const vote = (nomination: string) => {
		console.log(`voted for ${nomination}`);
		console.log({ votes });
		console.log({ nominationsMap });
		const existingVoteIdx = votes.indexOf(nomination);
		if (existingVoteIdx !== -1) {
			votes.splice(existingVoteIdx, 1);
			votes = votes;
		} else {
			votes = [...votes, nomination];
		}
	};

	let myNominations = $derived(data.myNominations ?? []);
	let myVotes = $derived(data.myVotes ?? []);
	let isClosed = $derived(session.closedAt != null);
	let nominations = $derived(session.nominations);
	let voteStr = $derived(votes.map((v) => v).join(' '));
	let nominationsMap = $derived(session.nominations.reduce(
		(prev: Record<string, string>, curr: Nomination) => ({ ...prev, [curr.id]: curr.value }),
		{}
	));
	let winnerNomination = $derived(session.winner ? session.nominations.find(n => n.id === session.winner) : null);
	let votedUserCount = $derived(votedUsers?.length ?? 0);
</script>

<div class="fixed top-0 right-0 m-2 px-2 py-1 transition-all bg-gray-200 dark:bg-gray-800 rounded-md flex items-center gap-2">
    {#if connected}
        <div class="w-2 h-2 rounded-full bg-green-500">&nbsp;</div>
        connected
    {:else}
        <span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
        disconnected
    {/if}
</div>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
        /
		<a href="/etc/quick-pick" class="text-blue-400 hover:underline">etc/quick-pick</a>
		/{session.id}
	</div>
</div>

<section class="container mx-auto px-2 md:px-0 flex h-screen flex-wrap content-center relative">
	<h1 class="font-bold text-6xl w-full mb-4">quick pick</h1>
	<div class="w-full">
		<p>
			{session.participants.length}
			{#if session.participants.length === 1}person is{:else}people are{/if} in the room.
		</p>

		{#if session.isHost}
			<p>You're the host!</p>

			{#if isClosed}
				<p>
					{votedUserCount}
					{#if votedUserCount === 1}person has{:else}people have{/if} voted.
				</p>
			{:else}
				<p>
					{nominations.length}
					{#if nominations.length === 1}nomination has{:else}nominations have{/if} been submtted.
				</p>
			{/if}

			{#if !session.winner}
				{#if isClosed}
					<form method="POST" action={`${session.id}/?/open`} use:enhance>
						<Button class="my-2" type="submit">open submissions</Button>
					</form>
					<form method="POST" action={`${session.id}/?/finalize`} use:enhance>
						<Button class="my-2" type="submit">finalize votes</Button>
					</form>
				{:else}
					<form method="POST" action={`${session.id}/?/close`} use:enhance>
						<Button variant="danger" type="submit">close submissions</Button>
					</form>
				{/if}
			{/if}
		{/if}

		{#if myNominations.length < session.maxNominations}
			{#if !isClosed && !form?.success}
				<form method="POST" action={`${session.id}/?/nominate`} use:enhance>
					{#if session.mode === 'movie'}
						<MovieAutocomplete onSelect={(movie) => { selectedMovie = movie; }} />
						<input type="hidden" name="nomination" value={selectedMovie?.title ?? ''} />
						<input type="hidden" name="metadata" value={selectedMovie ? JSON.stringify(selectedMovie) : ''} />
						<Button type="submit" disabled={!selectedMovie}>submit</Button>
					{:else}
						<Input label="nomination" name="nomination" type="text" required={true} />
						<Button type="submit">submit</Button>
					{/if}
				</form>
			{/if}
		{/if}

		{#if myNominations.length > 0}
			<div>
				<p>You've submitted: <strong>{myNominations.join(', ')}</strong></p>
			</div>
		{/if}

		{#if isClosed && !session.winner}
			{#if myVotes.length === 0}
				{#each nominations as nomination}
					<VotingCard
						id={nomination.id}
						text={nomination.value}
						vote={votes.indexOf(nomination.id)}
						totalNominations={nominations.length}
						metadata={nomination.metadata}
						onclick={() => vote(nomination.id)}
					/>
				{/each}

				<form method="POST" action={`${session.id}/?/vote`} use:enhance>
					<input name="votes" type="hidden" bind:value={voteStr} />
					<Button disabled={votes.length !== nominations.length}>Submit votes</Button>
				</form>
			{:else}
				<p>Your votes were submitted. Wait for the host to finalize.</p>
			{/if}
		{:else if session.winner && winnerNomination}
			<div class="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
				<p class="text-lg">The winner is <strong>{winnerNomination.value}</strong>!</p>
				{#if winnerNomination.metadata}
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
						{#if winnerNomination.metadata.originCountry}
							{countryCodeToFlag(winnerNomination.metadata.originCountry)}
						{/if}
						{#if winnerNomination.metadata.year}
							{winnerNomination.metadata.year}
						{/if}
						{#if winnerNomination.metadata.genres && winnerNomination.metadata.genres.length > 0}
							&middot; {winnerNomination.metadata.genres.join(', ')}
						{/if}
						{#if winnerNomination.metadata.director}
							&middot; Dir. {winnerNomination.metadata.director}
						{/if}
					</p>
					{#if winnerNomination.metadata.tagline}
						<p class="text-sm italic text-gray-500 dark:text-gray-400 mt-2">
							"{winnerNomination.metadata.tagline}"
						</p>
					{/if}
				{/if}
			</div>

			{#if session.rankings && session.rankings.length > 1}
				<div class="mt-6">
					<h2 class="text-xl font-semibold mb-3">Full Rankings</h2>
					<ol class="space-y-2">
						{#each session.rankings as nominationId, index}
							{@const nomination = session.nominations.find(n => n.id === nominationId)}
							{#if nomination}
								<li class="flex items-start gap-3 p-3 rounded-md {index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 ring-1 ring-yellow-200 dark:ring-yellow-700' : 'bg-gray-50 dark:bg-gray-800/50'}">
									<span class="font-mono font-bold text-xl w-8 text-center flex-shrink-0 {index === 0 ? 'text-yellow-600 dark:text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700 dark:text-amber-500' : 'text-gray-400'}">
										{index + 1}
									</span>
									<div class="flex-1 min-w-0">
										<span class="font-medium text-lg">{nomination.value}</span>
										{#if nomination.metadata}
											<div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
												{#if nomination.metadata.originCountry}
													<span>{countryCodeToFlag(nomination.metadata.originCountry)}</span>
												{/if}
												{#if nomination.metadata.year}
													<span>{nomination.metadata.year}</span>
												{/if}
												{#if nomination.metadata.genres && nomination.metadata.genres.length > 0}
													<span class="mx-1">&middot;</span>
													<span>{nomination.metadata.genres.slice(0, 3).join(', ')}</span>
												{/if}
												{#if nomination.metadata.director}
													<span class="mx-1">&middot;</span>
													<span>Dir. {nomination.metadata.director}</span>
												{/if}
											</div>
											{#if nomination.metadata.tagline}
												<div class="text-sm italic text-gray-400 dark:text-gray-500 mt-1">
													"{nomination.metadata.tagline}"
												</div>
											{/if}
										{/if}
									</div>
								</li>
							{/if}
						{/each}
					</ol>
				</div>
			{/if}
		{/if}
	</div>
</section>
