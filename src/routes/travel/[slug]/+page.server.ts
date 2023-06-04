import type { Block } from '$lib/types';
import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = ({ params }) => {
	const slug = params.slug;

	if (!slug) throw redirect(300, '/travel');

	const postDetails: Record<
		string,
		{
			title: string;
			excerpt: string;
			timestamp: number;
			content: {
				blocks: Block[];
			};
		}
	> = {
		bcn: {
			title: 'Starting the journey in Barcelona',
			excerpt:
				'Exploring the vibrant streets of Barcelona, trying delicious tapas and visiting the famous Sagrada Familia.',
			timestamp: 1620316800000,
			content: {
				blocks: [
					{
						type: 'header',
						data: {
							text: 'Day 1: Exploring the streets of Barcelona',
							level: 2
						},
						id: 'oeuhrgrR'
					},
					{
						type: 'paragraph',
						data: {
							text: 'We started our journey in the beautiful city of Barcelona. The streets were lively and bustling with activity. We visited the famous Sagrada Familia and admired its unique architecture. In the evening, we tried some delicious tapas at a local restaurant.'
						},
						id: 'owueh48'
					},
					{
						type: 'image',
						data: {
							caption: 'Sagrada Familia',
							file: {
								url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Sagrada_Familia_8-12-21_%281%29.jpg/440px-Sagrada_Familia_8-12-21_%281%29.jpg'
							}
						},
						id: 'woijU*FYE'
					},
					{
						type: 'header',
						data: {
							text: 'Day 2: Beach day in Sitges',
							level: 2
						},
						id: 'aeuhfIUSDH'
					},
					{
						type: 'paragraph',
						data: {
							text: 'We took a day trip to Sitges, a beautiful seaside town near Barcelona. The beach was perfect for swimming and sunbathing. We also explored the town and tried some delicious seafood.'
						},
						id: 'FEUIYFuef'
					},
					{
						type: 'quote',
						data: {
							text: 'The beach in Sitges was amazing. I could spend hours just floating in the sea.',
							caption: 'Jane, travel companion'
						},
						id: 'FIEURHrurfhr'
					}
				]
			}
		},
		ams: {
			title: 'Cycling in Amsterdam',
			excerpt:
				'Renting bikes and discovering the beautiful canals, cozy streets, and cultural landmarks of Amsterdam.',
			timestamp: 1620589200000,
			content: {
				blocks: [
					{
						type: 'header',
						data: {
							text: 'Day 1: Biking through Amsterdam',
							level: 2
						},
						id: 'FEUHFhf'
					},
					{
						type: 'paragraph',
						data: {
							text: "We rented bikes and explored Amsterdam's beautiful canals and cozy streets. The city is very bike-friendly, and it was a great way to see the sights. We visited the Anne Frank House and the Van Gogh Museum, and tried some delicious Dutch treats like stroopwafels and bitterballen."
						},
						id: 'FIEHFUrhfhv'
					},
					{
						type: 'image',
						data: {
							caption: 'Biking through Amsterdam',
							file: {
								url: 'https://example.com/amsterdam/biking.jpg'
							}
						},
						id: 'FivvfifFIJ'
					},
					{
						type: 'header',
						data: {
							text: "Day 2: Discovering Amsterdam's hidden gems",
							level: 2
						},
						id: 'KDFNEijff'
					},
					{
						type: 'paragraph',
						data: {
							text: "We ventured off the beaten path and discovered some of Amsterdam's hidden gems. We visited the Hortus Botanicus, a beautiful botanical garden, and the Tropenmuseum, which showcases the culture and history of the Dutch colonies. We also tried some local beer at a cozy pub."
						},
						id: 'FcKSKSQQW'
					},
					{
						type: 'quote',
						data: {
							text: 'I loved biking through Amsterdam. It was a great way to see the city and experience Dutch culture.',
							caption: 'John, travel companion'
						},
						id: 'FEIfjcjccwwpwpqQ'
					}
				]
			}
		}
	};

	if (slug in postDetails) {
		return postDetails[slug as keyof typeof postDetails];
	}

	throw 404;
};
