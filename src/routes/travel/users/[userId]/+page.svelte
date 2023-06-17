<script lang="ts">
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
	import { Passage } from '@passageidentity/passage-js';

	export let data;

	const { user } = data;
	const passage = new Passage(PUBLIC_PASSAGE_APP_ID);
	const currentUser = passage.getCurrentUser();

	// stackoverflow my beloved
	const prettyDate = (time: string) => {
		var date = new Date(time),
			diff = (new Date().getTime() - date.getTime()) / 1000,
			day_diff = Math.floor(diff / 86400);

		if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;

		return (
			(day_diff == 0 &&
				((diff < 60 && 'just now') ||
					(diff < 120 && '1 minute ago') ||
					(diff < 3600 && Math.floor(diff / 60) + ' minutes ago') ||
					(diff < 7200 && '1 hour ago') ||
					(diff < 86400 && Math.floor(diff / 3600) + ' hours ago'))) ||
			(day_diff == 1 && 'Yesterday') ||
			(day_diff < 7 && day_diff + ' days ago') ||
			(day_diff < 31 && Math.ceil(day_diff / 7) + ' weeks ago')
		);
	};
</script>

<main class="container mx-auto my-16">
	<div class="mb-6">
		<h1 class="text-4xl font-mono">{user.user_metadata?.name ?? user.email}</h1>
		<h2 class="font-mono text-gray-500 dark:text-gray-400">
			{user.id}{user.user_metadata?.name && ` - ${user.email}`}
		</h2>
	</div>
	<div class="flex justify-between flex-wrap">
		<h2 class="font-mono text-3xl font-bold mt-4">Devices</h2>
		<button on:click={() => passage.newLoginMagicLink(user.email)}>send a magic link</button>
	</div>
	<div class="flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<table class="min-w-full divide-y divide-gray-700">
					<thead>
						<tr>
							<th
								scope="col"
								class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-black dark:text-white sm:pl-0"
								>ID</th
							>
							<th
								scope="col"
								class="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-white"
								>Name</th
							>
							<th
								scope="col"
								class="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-white"
								>Usage count</th
							>
							<th
								scope="col"
								class="px-3 py-3.5 text-left text-sm font-semibold text-black dark:text-white"
								>Last used</th
							>
							<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
								<span class="sr-only">Delete</span>
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-800">
						{#each user.webauthn_devices as device}
							<tr>
								<td
									class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold font-mono text-black dark:text-white sm:pl-0"
									>{device.id}</td
								>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300"
									>{device.friendly_name}</td
								>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300"
									>{device.usage_count}</td
								>
								<td
									class="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300"
									title={device.last_login_at}>{prettyDate(device.last_login_at)}</td
								>
								<td
									class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"
								>
									<button
										class="text-red-500 hover:text-red-600 transition dark:text-red-400 dark:hover:text-red-300"
										>Delete<span class="sr-only">, {device.id}</span></button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</main>
