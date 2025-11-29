import { error, type Cookies } from '@sveltejs/kit';

export const getUser = async (cookies: Cookies) => {
	const authToken = cookies.get('psg_auth_token');
	if (!authToken) {
		error(401, 'Not authenticated');
	}

    return null;
};

export const isAdmin = (user: UserObject): boolean => {
	return !!user.user_metadata?.isjackson;
};
