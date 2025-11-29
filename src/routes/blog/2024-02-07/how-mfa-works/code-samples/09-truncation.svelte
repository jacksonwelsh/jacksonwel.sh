<script lang="ts">
	import CodeSample from './code-sample.svelte';
	import { hmacs } from '../store';

	const buf2hex = (buffer: ArrayBuffer) => {
		return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
	};

	const getBinCode = (hmac: ArrayBuffer) => {
		const hmacArray = new Uint8Array(hmac);
		const offset = hmacArray[19] & 0x0f;
		return (
			((hmacArray[offset] & 0x7f) << 24) |
			((hmacArray[offset + 1] & 0xff) << 16) |
			((hmacArray[offset + 2] & 0xff) << 8) |
			(hmacArray[offset + 3] & 0xff)
		);
	};

	let code = $derived(`// hmacBuffer represents the value returned by HMAC-SHA-1 since subtleCrypto.digest returns an ArrayBuffer
const hmacArray = new Uint8Array(hmacBuffer);  // [${new Uint8Array($hmacs[2])}]

// this is pulled straight from the RFC
const offset = hmacArray[19] & 0x0f;  // ${new Uint8Array($hmacs[2])[19] & 0x0f}
const binCode =
  ((hmacArray[offset] & 0x7f) << 24) |
  ((hmacArray[offset + 1] & 0xff) << 16) |
  ((hmacArray[offset + 2] & 0xff) << 8) |
  (hmacArray[offset + 3] & 0xff);  // ${getBinCode($hmacs[2])}

// Codes can be 6-8 digits; replace 6 with the desired length.
return binCode % Math.pow(10, 6);  // ${getBinCode($hmacs[2]) % Math.pow(10, 6)}
`);
</script>

<CodeSample {code} />
