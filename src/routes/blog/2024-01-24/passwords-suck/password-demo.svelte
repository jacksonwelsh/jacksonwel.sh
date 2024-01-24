<script lang="ts">
	import Button from '$lib/button.svelte';
	import ControlledInput from '$lib/input.svelte';

	let password = '';
	let passwordRepeat = '';
	let timesSubmitted = 0;
	let errorMessage = 'Your password has expired. Please select a new password.';
	let oldPassword = '';

	$: passwordsMatch = password === passwordRepeat || passwordRepeat.length === 0;

	let repeatClassName = '';

	$: {
		if (!passwordsMatch && passwordRepeat.length > 0) {
			repeatClassName = "ring !ring-red-500 after:content-['passwords_must_match']";
		} else {
			repeatClassName = '';
		}
	}

	const makeHash = async (password: string): Promise<string> => {
		if (typeof window === 'undefined') return '';
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
		return hashHex;
	};

	const handleSubmit = async () => {
		if (password !== passwordRepeat) {
			errorMessage = 'Passwords must match.';
			return;
		}

		if (password.length < 12) {
			errorMessage = 'Your password must be at least 12 characters long.';
			return;
		}

		let passwordHash = await makeHash(password);
		// check hibp for fun
		const pwnedHash = await fetch(
			`https://api.pwnedpasswords.com/range/${passwordHash.slice(0, 5)}`
		)
			.then((res) => res.text())
			.then((text) => text.split('\r\n'))
			.then((lines) => lines.map((line) => line.split(':')))
			.then((lines) => lines.filter((line) => line[0] === passwordHash.slice(5).toUpperCase()));

		if (pwnedHash.length > 0) {
			console.log({ pwnedHash });
			errorMessage = `Your password has been pwned ${pwnedHash[0][1]} times (no, really). Please choose a different password.`;
			return;
		}

		if (password === oldPassword || timesSubmitted == 0) {
			timesSubmitted += 1;
			errorMessage = 'Your password must be different from your last 5 passwords.';
			oldPassword = password;
			return;
		}

		errorMessage = '';
		return;
	};
</script>

<div class="p-4">
	<h2 class="text-2xl mt-0">ZomboCom Login</h2>
	{#if errorMessage !== ''}
		<div
			class="flex items-center rounded-md border dark:border-red-600 border-red-400 dark:bg-red-900/25 bg-red-100 dark:text-red-200 text-red-800 p-4 mb-4"
		>
			<div class="text-sm">{errorMessage}</div>
		</div>
	{:else}
		<div
			class="flex items-center rounded-md border dark:border-green-600 border-green-400 dark:bg-green-900/25 bg-green-100 dark:text-green-200 text-green-800 p-4 mb-4"
		>
			<div class="text-sm">
				Nice! You chose a reasonably secure password. Read on to learn about how we can do away with
				this nonsense once and for all.
			</div>
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit}>
		<ControlledInput bind:value={password} label="Enter new password" type="password" />
		<ControlledInput
			bind:value={passwordRepeat}
			label="Repeat new password"
			type="password"
			bind:className={repeatClassName}
		/>
		{#if !passwordsMatch}
			<div class="text-red-500">Passwords must match</div>
		{/if}
		<Button type="submit" size="lg">Submit</Button>
	</form>
</div>
