import type { Post } from '$lib/types';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = () => {
	const posts: Post[] = [
		{
			slug: 'bcn',
			title: 'Starting the journey in Barcelona',
			excerpt:
				'Exploring the vibrant streets of Barcelona, trying delicious tapas and visiting the famous Sagrada Familia.',
			timestamp: 1620320400000 // May 6, 2021 12:00:00 AM GMT+2
		},
		{
			slug: 'ams',
			title: 'Cycling in Amsterdam',
			excerpt:
				'Renting bikes and discovering the beautiful canals, cozy streets, and cultural landmarks of Amsterdam.',
			timestamp: 1620598800000 // May 10, 2021 12:00:00 AM GMT+2
		},
		{
			slug: 'swz',
			title: 'Hiking in the Swiss Alps',
			excerpt:
				'Breathing fresh mountain air, enjoying breathtaking views, and challenging oneself on a hiking trail in the Swiss Alps.',
			timestamp: 1620931200000 // May 14, 2021 12:00:00 AM GMT+2
		},
		{
			slug: 'prs',
			title: 'Sightseeing in Paris',
			excerpt:
				'Admiring the iconic Eiffel Tower, strolling along the Seine river, and indulging in French cuisine in Paris.',
			timestamp: 1621257600000 // May 18, 2021 12:00:00 AM GMT+2
		},
		{
			slug: 'lis',
			title: 'Beach time in Lisbon',
			excerpt:
				'Relaxing on the sandy beaches of Lisbon, trying seafood delicacies, and soaking up the Portuguese sun.',
			timestamp: 1621749600000 // May 23, 2021 12:00:00 AM GMT+2
		}
	];

	return { posts };
};
