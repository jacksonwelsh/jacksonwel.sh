export type SeriesPoint = {
	t: number; // unix seconds
	p: number; // probability 0..1
};

export type Market = {
	id: string;
	platform: 'polymarket' | 'kalshi';
	title: string;
	category: string;
	subcategory: string | null;
	resolutionDate: string; // ISO date
	volume: number; // USD
	currentProbability: number; // 0..1
	series: SeriesPoint[];
	url?: string;
};

// What the server sends to the client: the day's full market plus the autocomplete pool.
export type Puzzle = Market & { index: number };

export enum GuessResult {
	UNUSED,
	WRONG,
	CORRECT
}

export type DailyState = {
	puzzleIndex: number;
	guesses: string[]; // selected market titles
	gameOver: boolean;
	hasWon: boolean;
};

// Number of guesses (and revealed hints + 1) the player gets.
export const MAX_GUESSES = 6;

export const BETDLE_SCORE_LS = 'betdle/scores';
export const BETDLE_DAILY_STATE_LS = 'betdle/daily-state';

// Score = number of guesses used to win (1-indexed), or 0 if lost.
export const getScore = (results: GuessResult[]): number => {
	const idx = results.indexOf(GuessResult.CORRECT);
	return idx === -1 ? 0 : idx + 1;
};

// Hints unlock one-by-one as the player guesses wrong. There are MAX_GUESSES - 1 of them, so the
// final guess is made with everything short of the answer revealed.
export type HintKey = 'category' | 'subcategory' | 'resolutionDate' | 'volume' | 'platform';

export const REVEAL_ORDER: { key: HintKey; label: string }[] = [
	{ key: 'category', label: 'Category' },
	{ key: 'subcategory', label: 'Subcategory' },
	{ key: 'resolutionDate', label: 'Resolves' },
	{ key: 'volume', label: 'Volume' },
	{ key: 'platform', label: 'Platform' }
];

const platformNames: Record<Market['platform'], string> = {
	polymarket: 'Polymarket',
	kalshi: 'Kalshi'
};

// Human-readable value for a given hint, derived from the puzzle.
export const hintValue = (puzzle: Puzzle, key: HintKey): string => {
	switch (key) {
		case 'category':
			return puzzle.category;
		case 'subcategory':
			return puzzle.subcategory ?? '—';
		case 'resolutionDate':
			return new Date(puzzle.resolutionDate).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				timeZone: 'UTC'
			});
		case 'volume':
			return formatVolume(puzzle.volume);
		case 'platform':
			return platformNames[puzzle.platform];
	}
};

export const formatVolume = (volume: number): string => {
	if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
	if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
	return `$${Math.round(volume)}`;
};
