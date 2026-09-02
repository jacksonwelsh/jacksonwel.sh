export type ActivityType = 'outdoor_ride' | 'indoor_ride' | 'run' | 'walk' | 'hike';

export type Metrics = {
	duration_seconds?: number;
	moving_duration_seconds?: number;
	distance_meters?: number;
	active_energy_kcal?: number;
	elevation_gain_meters?: number;
	average_speed_mps?: number;
	maximum_speed_mps?: number;
	average_heart_rate_bpm?: number;
	maximum_heart_rate_bpm?: number;
	average_power_watts?: number;
	maximum_power_watts?: number;
	average_cadence_rpm?: number;
	work_kilojoules?: number;
};

export type Photo = {
	id: string;
	sort_order: number;
	cover: boolean;
	status: 'pending' | 'ready';
	feed_url?: string;
	thumbnail_url?: string;
};

export type RoutePoint = { latitude: number; longitude: number; altitude_meters?: number };
export type MetricStream = { metric: string; unit: string; samples: [number, number][] };

export type ActivityInterval = {
	index?: number;
	duration_seconds?: number;
	power_zone?: number | null;
	[key: string]: unknown;
};

export type ActivityZones = {
	power_seconds?: Record<string, number>;
	heart_rate_seconds?: Record<string, number>;
	[key: string]: unknown;
};

export type ActivitySummary = {
	id: string;
	canonical_url: string;
	type: ActivityType;
	virtual: boolean;
	title: string;
	description_html: string;
	local_date: string;
	metrics: Metrics;
	route_snapshot_url?: string;
	photos: Photo[];
};

export type ActivityDetail = ActivitySummary & {
	route_segments: RoutePoint[][];
	laps: Record<string, unknown>[];
	intervals: ActivityInterval[];
	zones: ActivityZones;
};

export type ActivityPage = { activities: ActivitySummary[]; next_cursor?: string };
