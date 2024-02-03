<script lang="ts">
	import CodeSample from './code-sample.svelte';
	import { hmacs } from '../store';

	const buf2hex = (buffer: ArrayBuffer) => {
		return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
	};

	$: code = `const hmac = await window.crypto.subtle.digest('SHA-1', outerWithHash);
// -> ${buf2hex($hmacs[2])} (converted to hex for readability)
`;
</script>

<CodeSample {code} />
