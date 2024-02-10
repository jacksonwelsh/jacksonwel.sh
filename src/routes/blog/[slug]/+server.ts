import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import entries from '../entries';

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug;
	if (!slug) {
		error(404);
	}

	const matches = entries.filter((entry) => entry.slug === slug || entry.date === slug);
	if (matches.length !== 1) {
		error(404);
	}

	const match = matches[0];

	redirect(308, `/blog/${match.date}/${match.slug}`);
};
