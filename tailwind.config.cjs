module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			sans: ['Inter', 'system-ui', 'sans-serif'],
			mono: [
				'JetBrains\\ Mono',
				'IBM\\ Plex\\ Mono',
				'Fira\\ Code',
				'Consolas',
				'Monaco',
				'monospaced'
			]
		},
		extend: {
			listStyleType: {
				dash: '"-\t"'
			}
		}
	},
	plugins: []
};
