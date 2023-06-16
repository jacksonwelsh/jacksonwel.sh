import type { ServerLoad } from '@sveltejs/kit';
import { getAllPosts } from './write/workers';

export const load: ServerLoad = async () => {
	const posts = await getAllPosts();

	return { posts };
};
