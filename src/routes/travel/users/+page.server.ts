import { PASSAGE_API_KEY } from '$env/static/private';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import { getUser, isAdmin } from '$lib/user';
import { error, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ cookies }) => {
	console.log({ cookies });

	const user = await getUser(cookies);
	if (!user) {
		throw error(401, 'Authentication token supplied was invalid or expired');
	}

	if (!isAdmin(user)) {
		throw error(403, 'Not authorized to access this page');
	}

	const users = await fetch(`https://api.passage.id/v1/apps/${PUBLIC_PASSAGE_APP_ID}/users`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${PASSAGE_API_KEY}`
		}
	}).then((r) => r.json());

	console.log({ users });
	return { users };
};
