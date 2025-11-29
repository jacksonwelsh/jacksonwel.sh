import { PASSAGE_API_KEY } from '$env/static/private';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import { getUser, isAdmin } from '$lib/user';
import { error, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ cookies, params }) => {
	const requestingUser = await getUser(cookies);
	if (!requestingUser) {
		error(401, 'Authentication token supplied was invalid or expired');
	}

	if (!isAdmin(requestingUser)) {
		error(403, 'Not authorized to access this page');
	}

	const user = await fetch(
		`https://api.passage.id/v1/apps/${PUBLIC_PASSAGE_APP_ID}/users/${params.userId}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${PASSAGE_API_KEY}`
			}
		}
	).then((r) => r.json());

	console.log({ user });
	return { user: user.user };
};
