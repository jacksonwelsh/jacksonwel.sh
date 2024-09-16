export enum HintState {
	VERY_LOW,
	LOW,
	CORRECT,
	HIGH,
	VERY_HIGH,
	DISABLED,
	UNKNOWN
}

export type DailyState = {
	puzzleIndex: number;
	guesses: string[];
	gameOver: boolean;
	hasWon: boolean;
};

export const getScore = (results: HintState[]): number => {
	return results.indexOf(HintState.CORRECT) + 1;
};

export const POPDLE_SCORE_LS = 'popdle/scores';
export const POPDLE_DAILY_STATE_LS = 'popdle/daily-state';
