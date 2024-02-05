<script lang="ts">
	import { writable } from 'svelte/store';
	import { HMAC_BYTES, HMAC_IPAD, numToUint8Array } from '../mfaUtils';
	import { counter, secretBytes } from '../store';
	import CodeSample from './code-sample.svelte';
	import { onMount } from 'svelte';

	const appendCounter = (secretBytes: Uint8Array, counter: string) => {
		const counterInt = parseInt(counter);
		const counterBytes = numToUint8Array(counterInt);

		const paddedSecret = new Uint8Array(HMAC_BYTES);
		paddedSecret.set(secretBytes);

		const inner = new Uint8Array(HMAC_BYTES);
		for (let i = 0; i < paddedSecret.length; ++i) {
			inner[i] = paddedSecret[i] ^ HMAC_IPAD[i];
		}

		const innerWithCounter = new Uint8Array(HMAC_BYTES + counterBytes.length);

		innerWithCounter.set(inner);
		innerWithCounter.set(counterBytes, inner.length);

		return innerWithCounter;
	};

	const appendedCounter = writable(appendCounter($secretBytes, $counter));

	onMount(() => {
		$appendedCounter = appendCounter($secretBytes, $counter);
	});

	$: $appendedCounter = appendCounter($secretBytes, $counter);

	$: code = `const innerWithCounter = new Uint8Array(HMAC_BYTES + counterBytes.length);

innerWithCounter.set(inner);
innerWithCounter.set(counterBytes, inner.length);
// TODO this doesn't work right on the first load but corrects itself when the counter updates
// -> [${$appendedCounter}]
`;
</script>

<CodeSample {code} />
