<script lang="ts">
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import { HMAC_BYTES } from '../mfaUtils';
	import { secretBytes } from '../store';
	import CodeSample from './code-sample.svelte';
	import { writable } from 'svelte/store';

	const filledArray = writable(new Uint8Array(HMAC_BYTES));
	onMount(() => {
		$secretBytes.forEach((byte, i) => ($filledArray[i] = byte));
	});

	run(() => {
		$secretBytes.forEach((byte, i) => ($filledArray[i] = byte));
	});

	let code = $derived(`const keyBytes = base32ToUint8(secretKey);  // [${$secretBytes}]
const paddedKey = new Uint8Array(HMAC_BYTES);  // [${new Uint8Array(HMAC_BYTES)}]
paddedKey.set(keyBytes);  // [${$filledArray}]
`);
</script>

{#key secretBytes}
	<CodeSample {code} />
{/key}
