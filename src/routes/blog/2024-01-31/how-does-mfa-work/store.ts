import { derived, readable, writable } from 'svelte/store';
import { DT, base32ToUint8, hmac, uint8ToBase32 } from './mfaUtils';

export const initializeSecret = (set: (val: string) => void) => {
	if (typeof window !== 'undefined') {
		const preSavedSecret = window.localStorage.getItem('how-does-mfa-work.b32secret');
		if (preSavedSecret != null) {
			set(preSavedSecret);
		} else {
			const randomBytes = new Uint8Array(20);
			window.crypto.getRandomValues(randomBytes);
			const asBase32 = uint8ToBase32(randomBytes).toLowerCase();
			set(asBase32);

			window.localStorage.setItem('how-does-mfa-work.b32secret', asBase32);
		}
	}
};

export const secret = writable('', initializeSecret);

export const secretBytes = derived(secret, ($secret) => base32ToUint8($secret));

export const hoverBinRange = writable<[number, number]>([0, 0]);

export const clearHoverRange = () => hoverBinRange.set([0, 0]);

export const timestamp = readable(Math.floor(Date.now() / 100), (set) => {
	const interval = setInterval(() => {
		set(Math.floor(Date.now() / 100));
	}, 100);

	return () => {
		clearInterval(interval);
	};
});

export const counter = derived(timestamp, ($timestamp) => Math.floor($timestamp / 300).toString());

export const hmacs = derived(
	[secret, counter],
	([$secret, $counter], set) => {
		const counterInt = parseInt($counter);

		const ret = new Array(5);

		const promises = new Array(5);

		for (let i = 0; i < ret.length; ++i) {
			promises[i] = hmac($secret, (counterInt + i - 2).toString());
		}

		Promise.all(promises)
			.then((results) => results.forEach((result: ArrayBuffer, i) => (ret[i] = result)))
			.then(() => set(ret));
	},
	new Array<ArrayBuffer>(5)
);

export const codes = derived(
	[hmacs],
	([$hmacs]) => $hmacs.map((hmac) => DT(hmac).toString().padStart(6, '0')),
	new Array<string>(5).fill('000000')
);
