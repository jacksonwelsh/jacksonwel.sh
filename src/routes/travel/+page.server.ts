import type { ServerLoad } from '@sveltejs/kit';
import { getAllPosts } from './write/workers';

export const load: ServerLoad = async ({ setHeaders }) => {
	const posts = await getAllPosts();

	setHeaders({
		'cache-control': 'max-age=600'
	});

	return { posts };
};
