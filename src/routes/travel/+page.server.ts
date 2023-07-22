import type { ServerLoad } from '@sveltejs/kit';
import { getPostListing } from './write/workers';

export const load: ServerLoad = async () => {
	const listing = await getPostListing();

	console.log({ listing });

	return { listing };
};
