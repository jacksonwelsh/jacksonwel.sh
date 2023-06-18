import { PASSAGE_API_KEY } from '$env/static/private';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import { getUser, isAdmin } from '$lib/user';
import Passage from '@passageidentity/passage-node';
import { error, type Actions, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ cookies, params }) => {
	const requestingUser = await getUser(cookies);
	if (!requestingUser) {
		throw error(401, 'Authentication token supplied was invalid or expired');
	}

	if (!isAdmin(requestingUser)) {
		throw error(403, 'Not authorized to access this page');
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

export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const requestingUser = await getUser(cookies);
		if (!requestingUser) throw error(401, 'Not authenticated');
		if (!requestingUser.user_metadata?.isjackson) throw error(403, 'Not authorized');

		const formData = await request.formData();
		const name = formData.get('name');

		if (typeof name !== 'string') {
			throw error(400, `Type of name is ${typeof name}, expected string`);
		}

		const passage = new Passage({
			appID: PUBLIC_PASSAGE_APP_ID,
			apiKey: PASSAGE_API_KEY
		});

		if (!params.userId) throw error(400, 'Missing userId param');

		return await passage.user.update(params.userId, {
			user_metadata: {
				name
			}
		});
	}
};
