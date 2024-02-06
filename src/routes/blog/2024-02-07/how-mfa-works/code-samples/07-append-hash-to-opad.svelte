<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import CodeSample from './code-sample.svelte';
	import { counter, secretBytes } from '../store';
	import { HMAC_BYTES, HMAC_IPAD, HMAC_OPAD, numToUint8Array } from '../mfaUtils';
	import { onMount } from 'svelte';

	const buf2hex = (buffer: ArrayBuffer) => {
		return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
	};

	const makeInnerHash = async (secretBytes: Uint8Array, counter: number) => {
		if (typeof window == 'undefined') return '';

		const paddedKey = new Uint8Array(HMAC_BYTES);
		paddedKey.set(secretBytes);

		const messageBytes = numToUint8Array(counter);

		const inner = new Uint8Array(HMAC_BYTES);
		for (let i = 0; i < HMAC_BYTES; ++i) {
			inner[i] = paddedKey[i] ^ HMAC_IPAD[i];
		}

		const innerWithCounter = new Uint8Array(64 + messageBytes.length);
		innerWithCounter.set(inner);
		innerWithCounter.set(messageBytes, inner.length);

		return await window.crypto.subtle.digest('SHA-1', innerWithCounter);
	};

	const innerHash = derived([secretBytes, counter], ([$secretBytes, $counter], set) => {
		makeInnerHash($secretBytes, parseInt($counter)).then((result) => set(result as ArrayBuffer));
	});

	const xorWithOpad = (secretBytes: Uint8Array) => {
		const padded = new Uint8Array(HMAC_BYTES);
		padded.set(secretBytes);

		const outer = new Uint8Array(HMAC_BYTES);
		for (let i = 0; i < HMAC_BYTES; ++i) {
			outer[i] = padded[i] ^ HMAC_OPAD[i];
		}

		return outer;
	};

	const makeOuterWithHash = (innerHash: ArrayBuffer, secretBytes: Uint8Array) => {
		const innerHashArray = new Uint8Array(innerHash);
		const outerWithHash = new Uint8Array(innerHashArray.length + HMAC_BYTES);
		const outer = xorWithOpad(secretBytes);
		outerWithHash.set(outer);
		outerWithHash.set(innerHashArray, outer.length);

		return outerWithHash;
	};

	const outerWithHash = writable(new Uint8Array(HMAC_BYTES));

	onMount(() => ($outerWithHash = makeOuterWithHash($innerHash as ArrayBuffer, $secretBytes)));

	$: $outerWithHash = makeOuterWithHash($innerHash as ArrayBuffer, $secretBytes);

	$: code = `const outerWithHash = new Uint8Array(HMAC_BYTES + innerHash.length);
outerWithHash.set(outer);
outerWithHash.set(innerHash, outer.length);
// -> [${$outerWithHash}]
`;
</script>

<CodeSample {code} />
