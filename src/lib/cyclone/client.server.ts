import { env } from '$env/dynamic/private';
import type { ActivityDetail, ActivityPage, MetricStream } from './types';

const endpoint = () => (env.CYCLONE_API_URL || 'http://127.0.0.1:8080/v1').replace(/\/$/, '');

export async function cycloneFetch<T>(fetcher: typeof fetch, path: string): Promise<T> {
	const response = await fetcher(`${endpoint()}${path}`, {
		headers: { Accept: 'application/json' },
		signal: AbortSignal.timeout(5_000)
	});
	if (!response.ok) throw new CycloneResponseError(response.status);
	return response.json() as Promise<T>;
}

export const listActivities = (fetcher: typeof fetch, cursor?: string, order?: 'ride_date') => {
	const query = new URLSearchParams({ limit: '12' });
	if (cursor) query.set('cursor', cursor);
	if (order) query.set('order', order);
	return cycloneFetch<ActivityPage>(fetcher, `/activities?${query}`);
};

export const getActivity = (fetcher: typeof fetch, id: string) =>
	cycloneFetch<ActivityDetail>(fetcher, `/activities/${encodeURIComponent(id)}`);

export const getStreams = async (fetcher: typeof fetch, id: string) => {
	const data = await cycloneFetch<{ streams: MetricStream[] }>(
		fetcher,
		`/activities/${encodeURIComponent(id)}/streams?metrics=heart_rate,power,cadence,speed&points=600`
	);
	return data.streams;
};

export const getMapToken = async (fetcher: typeof fetch) => {
	const data = await cycloneFetch<{ mapkit_js_token: string }>(fetcher, '/maps/config');
	return data.mapkit_js_token;
};

export class CycloneResponseError extends Error {
	constructor(readonly status: number) {
		super(`Cyclone returned ${status}`);
	}
}
