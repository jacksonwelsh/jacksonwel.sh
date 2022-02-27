<script>
	const funnies = [
		'this is my website and i will shout.',
		'no thoughts, head empty.',
		'my thoughts: coming soon to a website near you!',
		'accept my opinions as fact.',
		'this will probably never be finished.',
		'i have been meaning to do this forever.',
		"this site's written in svelte!",
		'sometimes typescript feels like "java script."'
	];

	const xmur3 = (str) => {
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

	const dateHash = xmur3(new Date().toDateString())();

	const titleToUse = funnies[dateHash % funnies.length];
</script>

<section class="container mx-auto flex h-screen flex-wrap content-center">
	<h1 class="font-bold text-6xl w-full">{titleToUse}</h1>
	<p class="w-full">blog coming soon-ish.</p>
	<a class="font-bold underline w-full mt-6" href="/">return from whence you came</a>
</section>
