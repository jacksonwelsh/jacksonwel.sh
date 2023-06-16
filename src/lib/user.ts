import { PASSAGE_API_KEY } from '$env/static/private';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import Passage, { type UserObject } from '@passageidentity/passage-node';
import { error, type Cookies } from '@sveltejs/kit';

export const getUser = async (cookies: Cookies) => {
	const authToken = cookies.get('psg_auth_token');
	if (!authToken) {
		throw error(401, 'Not authenticated');
	}

	const passage = new Passage({
		appID: PUBLIC_PASSAGE_APP_ID,
		apiKey: PASSAGE_API_KEY
	});

	const userId = await passage.validAuthToken(authToken);

	if (!userId) {
		return null;
	}

	const user = await passage.user.get(userId);
	return user;
};

export const isAdmin = (user: UserObject): boolean => {
	return !!user.user_metadata?.isjackson;
};
