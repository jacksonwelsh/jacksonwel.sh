import { error, redirect, type ServerLoad } from '@sveltejs/kit';
import { getPost, signImageUrl } from '../write/workers';
import { getUser } from '$lib/user';

export const ssr = false;

export const load: ServerLoad = async ({ params, cookies }) => {
	const slug = params.slug;

	if (!slug) redirect(300, '/travel');

	const postDetails = await getPost(slug);

	const content = postDetails.content;
	const timestamp = (content?.time as number) ?? 0;

	const user = await getUser(cookies).catch(() => null);
	console.log({ user });
	if (!content) {
		error(500, 'idk what happened here');
	}
	if (!user) {
		const forcePrivacy = content?.forcePrivacy;
		if (forcePrivacy != null) {
			if (forcePrivacy) {
				error(409, 'must be signed in to view recent posts for privacy');
			}
			// if false, skip time check
		} else {
			const currentTime = new Date();
			if (currentTime.getTime() < timestamp + 86400 * 5 * 1000) {
				// 5 day holding period
				error(409, 'must be signed in to view recent posts for privacy');
			}
		}

		// omit private content
		postDetails.content.blocks = content.blocks.filter(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(block: Record<string, any>) => !block.tunes?.privacy?.isPrivate
		);

		console.log({ filteredContent: postDetails.content });
	}

	// hydrate image URLs
	postDetails.content.blocks = await Promise.all(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		content.blocks.map(async (block: Record<string, any>) => {
			if (block.type !== 'image') return block;
			const key = block.data?.file?.key;
			if (!key) return block;

			const presignedUrl = await signImageUrl(key);
			block.data.file.url = presignedUrl;
			return block;
		})
	);

	return postDetails;
};
