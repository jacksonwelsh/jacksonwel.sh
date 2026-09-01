import { listActivities } from '$lib/cyclone/client.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		return {
			page: await listActivities(fetch, url.searchParams.get('cursor') ?? undefined),
			unavailable: false
		};
	} catch {
		return { page: { activities: [] }, unavailable: true };
	}
};
