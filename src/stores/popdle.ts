import { writable } from 'svelte/store';

export type PopdleState = {
	population: number;
	tolerance: number;
	wideTolerance: number;
	hasWon: boolean;
};

export default writable<PopdleState>({
	population: 0,
	tolerance: 0.05,
	wideTolerance: 0.15,
	hasWon: false
});
