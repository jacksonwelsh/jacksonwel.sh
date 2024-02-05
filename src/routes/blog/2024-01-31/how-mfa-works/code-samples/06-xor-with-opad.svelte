<script lang="ts">
	import CodeSample from './code-sample.svelte';

	$: code = `const outer = new Uint8Array(HMAC_BYTES);
for (let i = 0; i < HMAC_BYTES; ++i) {
	outer[i] = paddedKey[i] ^ HMAC_OPAD[i];
}
`;
</script>

<CodeSample {code} />
