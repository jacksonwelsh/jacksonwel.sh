import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUser, isAdmin } from '$lib/user';
import { putPost } from '../workers';

export const POST: RequestHandler = async ({ request, url, cookies }) => {
	const body = await request.json();

	const editorData = body.editorData;
	const postId = body.postId;
	const slug = body.slug;
	const title = body.title;

	if (title == null) {
		error(400, 'title not present in form data');
	}
	if (slug == null) {
		error(400, 'slug not present in form data');
	}
	if (postId == null) {
		error(400, 'postId not present in form data');
	}
	if (editorData == null) {
		error(400, 'editorData not present in form data');
	}

	const user = await getUser(cookies);
	if (!user) {
		error(401, 'Not authenticated');
	}

	if (!isAdmin(user)) {
		error(403, 'Not authorized');
	}

	// save the editor data to workers KV
	return await putPost(
		title.toString(),
		slug.toString(),
		postId.toString(),
		JSON.parse(editorData.toString())
	);
	// i hope?
	return json({
		success: true,
		href: `${url.origin}/travel/${slug}`
	});
};
