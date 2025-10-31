<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Input from '$lib/input.svelte';
	import Button from '$lib/button.svelte';
	import VotingCard from './voting-card.svelte';

	export let form: FormData;
	export let data: PageData;

	type Nomination = { id: string; value: string };

	let session = data.session;
    let votedUsers = data.votedUsers;

	onMount(() => {
		const eventSource = new EventSource(`/etc/quick-pick/${session.id}/stream`);

		eventSource.onmessage = (event) => {
			const eventData = JSON.parse(event.data);
            session = eventData.session;
            votedUsers = eventData.votedUsers;
		};

		eventSource.onerror = () => {
			eventSource.close();
		};

		return () => eventSource.close();
	});

	let votes: string[] = [];
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

	$: myNominations = data.myNominations ?? [];
	$: myVotes = data.myVotes ?? [];
	$: isClosed = session.closedAt != null;
	$: nominations = session.nominations;
	$: voteStr = votes.map((v) => v).join(' ');
	$: nominationsMap = session.nominations.reduce(
		(prev: Record<string, string>, curr: Nomination) => ({ ...prev, [curr.id]: curr.value }),
		{}
	);
	$: votedUserCount = votedUsers?.length ?? 0;
</script>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		<a href="/etc/quick-pick" class="text-blue-400 hover:underline">/quick-pick</a>
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
					<Input label="nomination" name="nomination" type="text" required={true} />
					<Button type="submit">submit</Button>
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
						on:click={() => vote(nomination.id)}
					/>
				{/each}

				<form method="POST" action={`${session.id}/?/vote`} use:enhance>
					<input name="votes" type="hidden" bind:value={voteStr} />
					<Button disabled={votes.length !== nominations.length}>Submit votes</Button>
				</form>
			{:else}
				<p>Your votes were submitted. Wait for the host to finalize.</p>
			{/if}
		{:else if session.winner}
			<p>The winner is <strong>{nominationsMap[session.winner]}</strong>!</p>
		{/if}
	</div>
</section>
