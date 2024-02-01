import { derived, readable, writable } from 'svelte/store';
import { base32ToUint8, uint8ToBase32 } from './mfaUtils';

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