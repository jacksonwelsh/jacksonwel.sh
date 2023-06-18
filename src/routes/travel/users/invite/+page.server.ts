import { fail, type ServerLoad } from '@sveltejs/kit';
import { validateInviteCode } from '../../write/workers';
import type { Actions } from './$types';
import Passage from '@passageidentity/passage-node';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import { PASSAGE_API_KEY } from '$env/static/private';

export const load: ServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code')?.toString();
	const verification = await validateInviteCode(code ?? '');

	return {
		verification
	};
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const code = url.searchParams.get('code')?.toString();
		const verification = await validateInviteCode(code ?? '');

		if (!verification) {
			return fail(403, { code: 'Invalid invite code' });
		}

		const formData = await request.formData();

		const email = formData.get('email');
		const name = formData.get('name');

		if (typeof email !== 'string' || typeof name !== 'string') {
			return fail(400, { name: 'name and email must both be string types' });
		}

		const passage = new Passage({
			appID: PUBLIC_PASSAGE_APP_ID,
			apiKey: PASSAGE_API_KEY
		});

		return await passage.user
			.create({
				email: email,
				user_metadata: {
					name
				}
			})
			.then(() => ({ success: true }))
			.catch(() => ({ success: false }));
	}
};
