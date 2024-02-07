<script lang="ts">
	import { Edit, Renew } from 'carbon-icons-svelte';
	import ControlledInput from '$lib/input.svelte';
	import Button from '$lib/button.svelte';
	import { alphabet, getByteColor, HIGHLIGHT_CLASS } from './mfaUtils';
	import { clearHoverRange, genSecret, hoverBinRange, LS_KEY, secret, secretBytes } from './store';

	let editingSecret = false;
	let editableSecret = '';
	let secretEditErrorMessage = '';
	let newSecretButtonRef: HTMLButtonElement;

	let charRefs: HTMLSpanElement[] = new Array($secretBytes.length);

	const startSecretEdit = () => {
		editableSecret = $secret;
		editingSecret = true;
	};

	const saveSecret = () => {
		const transformed = editableSecret.replace(/[ =]/g, '').toLowerCase();
		const invalidChars = Array.from(transformed).filter((char) => !alphabet.includes(char));
		if (invalidChars.length > 0) {
			secretEditErrorMessage = `Invalid characters found in input: ${invalidChars.join(', ')}`;
			return;
		}

		if (transformed.length > 64) {
			secretEditErrorMessage = 'Maximum length: 64 characters';
			return;
		}

		if (transformed.length < 8) {
			secretEditErrorMessage = 'Minimum length: 8 characters';
			return;
		}

		charRefs = new Array($secretBytes.length);

		secretEditErrorMessage = '';
		$secret = transformed;
		window.localStorage.setItem(LS_KEY, $secret);
		editingSecret = false;
	};

	const pushHoverRange = (wordIndex: number) => {
		const start = wordIndex * 40;
		const end = (wordIndex + 1) * 40;
		$hoverBinRange = [start, end];
	};

	const onNewSecretClick = () => {
		console.log({ rt: newSecretButtonRef.style.transform });
		const exr = /rotate\((-?\d+)deg\)/;
		const justTheNumber = exr.exec(newSecretButtonRef.style.transform);
		console.log({ rt: newSecretButtonRef.style.transform, justTheNumber });
		const currRotation = parseInt(justTheNumber?.[1] ?? '0');
		newSecretButtonRef.style.transform = `rotate(${currRotation - 180}deg)`;

		$secret = genSecret();
	};

	$: {
		if (!editingSecret) {
			// first clear any previously hovered items
			charRefs
				.filter(
					(char, i) =>
						char.classList.contains(HIGHLIGHT_CLASS) &&
						!($hoverBinRange[0] <= i && i < $hoverBinRange[1])
				)
				.forEach((bit) => bit.classList.remove(HIGHLIGHT_CLASS));

			// then apply the class to newly hovered items
			charRefs
				.filter(
					(char, i) =>
						!char.classList.contains(HIGHLIGHT_CLASS) &&
						Math.floor($hoverBinRange[0] / 5) * 5 <= i &&
						i < $hoverBinRange[1]
				)
				.forEach((bit) => bit.classList.add(HIGHLIGHT_CLASS));
		}
	}
</script>

{#if !editingSecret}
	<div class="select-all flex gap-2">
		{#each $secret.match(/.{2,8}/g) ?? [] as chunk, chunkIdx}
			<span
				role="presentation"
				on:touchstart={() => pushHoverRange(chunkIdx)}
				on:mouseenter={() => pushHoverRange(chunkIdx)}
				on:mouseleave={clearHoverRange}
				style="-webkit-user-select: none"
				class={`font-mono font-mono-normal ${getByteColor(chunkIdx, 1)}`}
			>
				{#each Array.from(chunk) as char, charIdx}
					<span bind:this={charRefs[chunkIdx * 40 + charIdx * 5]}>{char}</span>
				{/each}
			</span>
		{/each}
		<div class="flex gap-4 ml-2 items-center">
			<button on:click={startSecretEdit}>
				<Edit
					size={20}
					title="edit"
					class="text-gray-600 dark:text-gray-400 hover:cursor-pointer"
				/>
			</button>
			<button
				on:click={onNewSecretClick}
				bind:this={newSecretButtonRef}
				class="transition-transform duration-500"
			>
				<Renew
					size={20}
					title="generate a new secret"
					class="text-gray-600 dark:text-gray-400 hover:cursor-pointer"
				/>
			</button>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center flex-wrap w-full">
		{#if secretEditErrorMessage !== ''}
			<div class="text-red-500 w-full">{secretEditErrorMessage}</div>
		{/if}
		<form
			on:submit|preventDefault={saveSecret}
			class="flex items-center justify-center flex-wrap w-full"
		>
			<ControlledInput bind:value={editableSecret} />
			<Button type="submit" class="w-full">save</Button>
		</form>
	</div>
{/if}
