import type { ServerLoad } from '@sveltejs/kit';
import markets from '$lib/data/betdle.json';
import type { Market, Puzzle } from '.';

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

const betdleEpoch = new Date(2024, 8, 16);
const oneDay = 1000 * 60 * 60 * 24; // One day in milliseconds

const pool = markets as Market[];

export const load: ServerLoad = async (): Promise<{ puzzle: Puzzle; titles: string[] }> => {
	const date = new Date();
	const index = Math.floor((Number(date) - Number(betdleEpoch)) / oneDay);
	// generate a hash of the current system date
	const dateHash = xmur3(date.toDateString())();

	const market = pool[dateHash % pool.length];
	const puzzle: Puzzle = { ...market, index };

	// Only the day's full market goes to the client; everything else is reduced to its title so the
	// autocomplete has a pool to match against without shipping every time series.
	const titles = pool.map((m) => m.title).sort((a, b) => a.localeCompare(b));

	return { puzzle, titles };
};
