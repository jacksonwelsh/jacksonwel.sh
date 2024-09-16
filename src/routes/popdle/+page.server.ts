import type { ServerLoad } from '@sveltejs/kit';
import populations from '../../../static/populations.json';

export type Puzzle = {
	pop: number;
	city: string;
	state: string;
	index: number;
};

// See https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
// Just an easy way to convert a string to a stable pseudorandom number.
const xmur3 = (str: string) => {
	for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	return function () {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
};

const popdleEpoch = new Date(2024, 8, 16);
const oneDay = 1000 * 60 * 60 * 24; // One day in milliseconds

export const load: ServerLoad = async (): Promise<{ puzzle: Puzzle }> => {
	const date = new Date();
	const index = Math.round((Number(date) - Number(popdleEpoch)) / oneDay);
	// generate a hash of the current system date
	const dateHash = xmur3(date.toDateString())();

	const population: Omit<Puzzle, 'index'> = populations[dateHash % populations.length];
	const puzzle: Puzzle = { ...population, index };
	console.log({ puzzle });

	return { puzzle };
};
