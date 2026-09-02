import { listActivities } from '$lib/cyclone/client.server';
import { localeFromHeader } from '$lib/cyclone/format';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, request, url }) => {
	const locale = localeFromHeader(request.headers.get('accept-language'));
	try {
		return {
			page: await listActivities(fetch, url.searchParams.get('cursor') ?? undefined, 'ride_date'),
			locale,
			unavailable: false
		};
	} catch {
		return { page: { activities: [] }, locale, unavailable: true };
	}
};
