import { getUser, isAdmin } from '$lib/user';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const ssr = false;

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await getUser(cookies);
	if (!user) {
		throw error(401, 'Not authenticated');
	}

	if (!isAdmin(user)) {
		throw error(403, 'Not authorized');
	}
};
