<script lang="ts">
	import CodeSample from './code-sample.svelte';

	const code = `const inner = new Uint8Array(HMAC_BYTES);
for (let i = 0; i < HMAC_BYTES; ++i) {
  inner[i] = paddedKey[i] ^ HMAC_IPAD[i]
}
`;
</script>

<CodeSample {code} />
