import { writable } from 'svelte/store';

const getInitialTheme = () => {
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	return false;
};

const createThemeStore = () => {
	const store = writable(getInitialTheme());

	const updateTheme = () => {
		if (typeof window !== 'undefined' && window.matchMedia) {
			store.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	};

	// Set up event listener on client-side
	if (typeof window !== 'undefined' && window.matchMedia) {
		const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQueryList.addEventListener('change', updateTheme);
	}

	return store;
};

export const isDarkTheme = createThemeStore();
