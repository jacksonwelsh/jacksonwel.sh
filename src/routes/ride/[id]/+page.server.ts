import { error } from '@sveltejs/kit';
import {
	CycloneResponseError,
	getActivity,
	getMapToken,
	getStreams
} from '$lib/cyclone/client.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	try {
		const activity = await getActivity(fetch, params.id);
		const [streams, mapToken] = await Promise.all([
			getStreams(fetch, params.id).catch(() => []),
			activity.route_segments.length ? getMapToken(fetch).catch(() => undefined) : undefined
		]);
		return { activity, streams, mapToken };
	} catch (cause) {
		if (cause instanceof CycloneResponseError && cause.status === 404)
			error(404, 'Activity not found');
		error(503, 'The activity feed is temporarily unavailable');
	}
};
