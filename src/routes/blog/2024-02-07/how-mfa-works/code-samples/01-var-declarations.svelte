<script lang="ts">
	import { numToUint8Array } from '../mfaUtils';
	import { counter, secret } from '../store';
	import CodeSample from './code-sample.svelte';

	$: code = `// HMAC_BYTES is the block size of our hash function, SHA-1
const HMAC_BYTES = 64;
// ipad is the byte 0x36 repeated HMAC_BYTES times
const HMAC_IPAD = new Array(HMAC_BYTES).fill(0x36);
// opad is the byte 0x5C repeated HMAC_BYTES times
const HMAC_OPAD = new Array(HMAC_BYTES).fill(0x5C);

const secretKey = "${$secret}";
const counterBytes = numToUint8Array(${$counter})  // [${numToUint8Array(parseInt($counter))}]
`;
</script>

<CodeSample {code} />
