import { derived, readable, writable } from 'svelte/store';
import { DT, alphabet, base32ToUint8, hmac, uint8ToBase32 } from './mfaUtils';

export const LS_KEY = 'how-mfa-works.b32secret';

export const genSecret = (): string => {
	const randomBytes = new Uint8Array(20);
	window.crypto.getRandomValues(randomBytes);
	const asBase32 = uint8ToBase32(randomBytes).toLowerCase();

	window.localStorage.setItem(LS_KEY, asBase32);
	return asBase32;
};

export const initializeSecret = (set: (val: string) => void) => {
	if (typeof window !== 'undefined') {
		const preSavedSecret = window.localStorage.getItem(LS_KEY) ?? '';
		const isValid =
			Array.from(preSavedSecret).every((char) => alphabet.includes(char)) &&
			preSavedSecret.length >= 8 &&
			preSavedSecret.length <= 64;

		if (isValid) {
			set(preSavedSecret);
		} else {
			set(genSecret());
		}
	}
};

export const secret = writable('', initializeSecret);

export const secretBytes = derived(secret, ($secret) => {
	if (typeof window == 'undefined') return new Uint8Array(0);
	return base32ToUint8($secret);
});

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

// the endless progression of time comes for us all, but for the purposes of this demo i think it's
// acceptable to put it on hold for a moment.
export const timeStopped = writable(false);
export const timeStoppedAt = writable(0);

export const counter = derived(
	[timestamp, timeStopped, timeStoppedAt],
	([$timestamp, $timeStopped, $timeStoppedAt]) => {
		if ($timeStopped) return Math.floor($timeStoppedAt / 300).toString();

		return Math.floor($timestamp / 300).toString();
	}
);

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
