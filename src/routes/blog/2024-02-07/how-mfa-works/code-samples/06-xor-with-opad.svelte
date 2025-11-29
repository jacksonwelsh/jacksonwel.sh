<script lang="ts">
	import { run } from 'svelte/legacy';

	import { writable } from 'svelte/store';
	import { HMAC_BYTES, HMAC_OPAD } from '../mfaUtils';
	import { secretBytes } from '../store';
	import CodeSample from './code-sample.svelte';
	import { onMount } from 'svelte';

	const xorWithOpad = (secretBytes: Uint8Array) => {
		const padded = new Uint8Array(HMAC_BYTES);
		padded.set(secretBytes);

		const outer = new Uint8Array(HMAC_BYTES);
		for (let i = 0; i < HMAC_BYTES; ++i) {
			outer[i] = padded[i] ^ HMAC_OPAD[i];
		}

		return outer;
	};

	const xored = writable(new Uint8Array(HMAC_BYTES));

	onMount(() => {
		$xored = xorWithOpad($secretBytes);
	});

	run(() => {
		$xored = xorWithOpad($secretBytes);
	});

	let code = $derived(`const outer = new Uint8Array(HMAC_BYTES);
for (let i = 0; i < HMAC_BYTES; ++i) {
	outer[i] = paddedKey[i] ^ HMAC_OPAD[i];
}
// -> [${$xored}]
`);
</script>

<CodeSample {code} />
