<script lang="ts">
	import Play from 'carbon-icons-svelte/lib/Play.svelte';
	import Pause from 'carbon-icons-svelte/lib/Pause.svelte';
	import Cafe from 'carbon-icons-svelte/lib/Cafe.svelte';
	import Portfolio from 'carbon-icons-svelte/lib/Portfolio.svelte';
	import NotificationIcon from 'carbon-icons-svelte/lib/Notification.svelte';
	import NotificationOff from 'carbon-icons-svelte/lib/NotificationOff.svelte';

	let timer = $state(0);
	let intervalId: NodeJS.Timeout | null = $state(null);
	let work = $state(true);
	let notifications = $state(false);

	let isRunning = $derived(intervalId !== null);
	let hours = $derived(Math.floor(timer / 3600));
	let minutes = $derived(Math.floor((timer / 60) % 60));
	let seconds = $derived(timer % 60);

	let formattedHours = $derived(hours.toString().padStart(2, '0'));
	let formattedMinutes = $derived(minutes.toString().padStart(2, '0'));
	let formattedSeconds = $derived(seconds.toString().padStart(2, '0'));

	// $: notificationPermission = Notification.permission;

	const tick = () => {
		if (work) timer += 1;
		else if (timer > 0) timer -= 1;
		else {
			if (notifications) {
				new Notification('Thirds', {
					body: 'Break is over!'
				});
			}
			stop();
			startWork();
		}
	};

	const start = () => {
		intervalId = setInterval(tick, 1000);
	};

	const stop = () => {
		if (intervalId) {
			clearInterval(intervalId);
		}
		intervalId = null;
	};

	const startWork = () => {
		work = true;
	};

	const startBreak = () => {
		work = false;
		timer = Math.floor(timer / 3);
	};

	const enableNotifications = () => {
		Notification.requestPermission().then((p) => {
			if (p === 'granted') {
				notifications = true;
			}
		});
	};

	const disableNotifications = () => {
		notifications = false;
	};
</script>

<div class="container mx-auto sm:px-4 h-screen flex flex-wrap content-center gap-4 justify-center">
	<h1 class="text-xl italic font-thin">Thirds</h1>
	<div class="w-full flex flex-wrap gap-1 items-center justify-center font-mono">
		<div class="grid items-center flex-wrap">
			{#if work}
				<span class="border-emerald-500 text-emerald-500 border px-2 py-1 mb-1 mr-auto text-sm"
					>Work</span
				>
			{:else}
				<span class="border-amber-500 text-amber-500 border px-2 py-1 mb-1 mr-auto text-sm"
					>Break</span
				>
			{/if}
			<span class="text-6xl font-bold flex-1 text-center">
				{formattedHours}:{formattedMinutes}:{formattedSeconds}
			</span>
		</div>
	</div>

	<button
		onclick={() => (isRunning ? stop() : start())}
		class="text-gray-400 hover:text-gray-100 transition"
	>
		{#if isRunning}
			<Pause size={24} />
		{:else}
			<Play size={24} />
		{/if}
	</button>
	<button
		onclick={() => (work ? startBreak() : startWork())}
		class="text-gray-400 hover:text-gray-100 transition"
	>
		{#if work}
			<Cafe size={24} />
		{:else}
			<Portfolio size={24} />
		{/if}
	</button>
	<button
		onclick={() => (notifications ? disableNotifications() : enableNotifications())}
		class="text-gray-400 hover:text-gray-100 transition"
	>
		{#if notifications}
			<NotificationOff size={24} />
		{:else}
			<NotificationIcon size={24} />
		{/if}
	</button>
</div>
