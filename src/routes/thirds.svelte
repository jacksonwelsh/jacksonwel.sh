<script lang="ts">
	import Play24 from 'carbon-icons-svelte/lib/Play24';
	import Pause24 from 'carbon-icons-svelte/lib/Pause24';
	import Coffee24 from 'carbon-icons-svelte/lib/Cafe24';
	import Briefcase24 from 'carbon-icons-svelte/lib/Portfolio24';
	import Notification24 from 'carbon-icons-svelte/lib/Notification24';
	import NotificationOff24 from 'carbon-icons-svelte/lib/NotificationOff24';

	let timer = 0;
	let intervalId: NodeJS.Timer | null = null;
	let work = true;
	let notifications = false;

	$: isRunning = intervalId !== null;
	$: hours = Math.floor(timer / 3600);
	$: minutes = Math.floor((timer / 60) % 60);
	$: seconds = timer % 60;

	$: formattedHours = hours.toString().padStart(2, '0');
	$: formattedMinutes = minutes.toString().padStart(2, '0');
	$: formattedSeconds = seconds.toString().padStart(2, '0');

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
		clearInterval(intervalId);
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
		on:click={() => (isRunning ? stop() : start())}
		class="text-gray-400 hover:text-gray-100 transition"
	>
		{#if isRunning}
			<Pause24 />
		{:else}
			<Play24 />
		{/if}
	</button>
	<button
		on:click={() => (work ? startBreak() : startWork())}
		class="text-gray-400 hover:text-gray-100 transition"
	>
		{#if work}
			<Coffee24 />
		{:else}
			<Briefcase24 />
		{/if}
	</button>
	<button
		on:click={() => (notifications ? disableNotifications() : enableNotifications())}
		class="text-gray-400 hover:text-gray-100 transition"
	>
		{#if notifications}
			<NotificationOff24 />
		{:else}
			<Notification24 />
		{/if}
	</button>
</div>
