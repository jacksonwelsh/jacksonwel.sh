<script lang="ts">
	import CodeSample from './code-sample.svelte';

	$: code = `const outerWithHash = new Uint8Array(HMAC_BYTES + innerHash.length);
outerWithHash.set(outer);
outerWithHash.set(innerHash, outer.length);
`;
</script>

<CodeSample {code} />
