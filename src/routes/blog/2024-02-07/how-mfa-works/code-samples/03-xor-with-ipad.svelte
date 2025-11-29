<script lang="ts">
	import { run } from 'svelte/legacy';

	import { writable } from 'svelte/store';
	import { HMAC_BYTES, HMAC_IPAD } from '../mfaUtils';
	import { secretBytes } from '../store';
	import CodeSample from './code-sample.svelte';
	import { onMount } from 'svelte';

	const xorWithIpad = (secretBytes: Uint8Array) => {
		console.log({ secretBytes });
		const padded = new Uint8Array(HMAC_BYTES);
		padded.set(secretBytes);

		const inner = new Uint8Array(HMAC_BYTES);
		for (let i = 0; i < HMAC_BYTES; ++i) {
			inner[i] = padded[i] ^ HMAC_IPAD[i];
		}

		console.log({ inner });

		return inner;
	};

	const xored = writable(xorWithIpad($secretBytes));

	let code: string = $derived(`const inner = new Uint8Array(HMAC_BYTES);
for (let i = 0; i < HMAC_BYTES; ++i) {
  inner[i] = paddedKey[i] ^ HMAC_IPAD[i]
}
// -> [${$xored}]
`);

	// hack to make sure this works right on the first render, would ideally use a derived but haven't
	// gotten that to work yet
	onMount(() => {
		$xored = xorWithIpad($secretBytes);
	});

	run(() => {
		$xored = xorWithIpad($secretBytes);
	});

	
</script>

{#key $xored}
	<CodeSample {code} />
{/key}
