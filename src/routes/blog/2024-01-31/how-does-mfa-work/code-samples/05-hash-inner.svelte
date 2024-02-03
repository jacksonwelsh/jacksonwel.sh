<script lang="ts">
	import CodeSample from './code-sample.svelte';
	import { secretBytes, counter } from '../store';
	import { HMAC_BYTES, HMAC_IPAD, base32ToUint8, numToUint8Array } from '../mfaUtils';
	import { derived } from 'svelte/store';
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
		makeInnerHash($secretBytes, parseInt($counter)).then((result) => set(buf2hex(result)));
	});

	$: code = `const innerHash = new Uint8Array(await window.crypto.subtle.digest('SHA-1', innerWithCounter));
// -> ${$innerHash} (converted to hex for readability)
`;
</script>

<CodeSample {code} />
