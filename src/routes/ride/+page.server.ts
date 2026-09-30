import { listActivities } from '$lib/cyclone/client.server';
import { localeFromHeader } from '$lib/cyclone/format';
import { ridePagination } from '$lib/cyclone/pagination';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, request, url }) => {
	const locale = localeFromHeader(request.headers.get('accept-language'));
	try {
		const page = await listActivities(
			fetch,
			url.searchParams.get('cursor') ?? undefined,
			'ride_date'
		);
		return {
			page,
			...ridePagination(url, page.next_cursor),
			locale,
			unavailable: false
		};
	} catch {
		return { page: { activities: [] }, ...ridePagination(url), locale, unavailable: true };
	}
};
