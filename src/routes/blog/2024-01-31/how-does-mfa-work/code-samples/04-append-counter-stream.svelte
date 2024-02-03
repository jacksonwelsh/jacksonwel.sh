<script lang="ts">
	import CodeSample from './code-sample.svelte';

	$: code = `const innerWithCounter = new Uint8Array(HMAC_BYTES + counterBytes.length);

//💡 Uint8Array.set allows us to copy other arrays into this one without a for loop
innerWithCounter.set(inner);
innerWithCounter.set(counterBytes, inner.length);
`;
</script>

<CodeSample {code} />
