module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			sans: ['Rubik', 'Inter', 'system-ui', 'sans-serif'],
			mono: [
				'Berkeley\\ MonoVF',
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
			},
			fontWeight: {
				'mono-thin': '100',
				'mono-light': '110',
				'mono-normal': '120',
				'mono-medium': '125',
				'mono-semibold': '130',
				'mono-bold': '140',
				'mono-black': '150'
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
