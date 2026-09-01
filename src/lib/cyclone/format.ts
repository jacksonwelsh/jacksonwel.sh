import type { ActivityType, Metrics } from './types';

export const activityName: Record<ActivityType, string> = {
	outdoor_ride: 'outdoor ride',
	indoor_ride: 'indoor ride',
	run: 'run',
	walk: 'walk',
	hike: 'hike'
};

export const date = (value: string) =>
	new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(
		new Date(`${value}T12:00:00Z`)
	);

export const duration = (seconds?: number) => {
	if (seconds == null) return undefined;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const stats = (metrics: Metrics) =>
	[
		metrics.distance_meters == null
			? undefined
			: { label: 'distance', value: `${(metrics.distance_meters / 1000).toFixed(1)} km` },
		duration(metrics.moving_duration_seconds ?? metrics.duration_seconds) == null
			? undefined
			: {
					label: 'time',
					value: duration(metrics.moving_duration_seconds ?? metrics.duration_seconds)!
				},
		metrics.elevation_gain_meters == null
			? undefined
			: { label: 'elevation', value: `${Math.round(metrics.elevation_gain_meters)} m` },
		metrics.average_power_watts == null
			? undefined
			: { label: 'power', value: `${Math.round(metrics.average_power_watts)} W` }
	].filter((item): item is { label: string; value: string } => item != null);

export const textExcerpt = (html: string, limit = 180) => {
	const plain = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return plain.length > limit ? `${plain.slice(0, limit).trimEnd()}…` : plain;
};
