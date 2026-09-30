import type { MetricStream, RoutePoint } from './types';

export function routePositionAt(
	segments: RoutePoint[][],
	elapsed: number | undefined
): RoutePoint | undefined {
	if (elapsed === undefined || !Number.isFinite(elapsed) || elapsed < 0) return undefined;
	for (const segment of segments) {
		for (let index = 0; index < segment.length; index++) {
			const point = segment[index];
			const start = point.elapsed_milliseconds;
			if (start === undefined || !Number.isFinite(start) || start < 0) continue;
			if (elapsed === start) return point;
			const next = segment[index + 1];
			const end = next?.elapsed_milliseconds;
			if (end === undefined || !Number.isFinite(end) || elapsed <= start || elapsed >= end)
				continue;
			const fraction = (elapsed - start) / (end - start);
			// Use the short direction when the visible route crosses the antimeridian.
			const longitudeDelta = ((next.longitude - point.longitude + 540) % 360) - 180;
			return {
				latitude: point.latitude + (next.latitude - point.latitude) * fraction,
				longitude: ((point.longitude + longitudeDelta * fraction + 540) % 360) - 180
			};
		}
	}
	return undefined;
}

export function timedElevation(segments: RoutePoint[][]): MetricStream | undefined {
	const samples: [number, number][] = [];
	const segmentStarts: number[] = [];
	for (const segment of segments) {
		let connected = false;
		for (const point of segment) {
			const elapsed = point.elapsed_milliseconds;
			if (
				elapsed !== undefined &&
				Number.isFinite(elapsed) &&
				elapsed >= 0 &&
				point.altitude_meters !== undefined &&
				Number.isFinite(point.altitude_meters)
			) {
				if (!connected && samples.length) segmentStarts.push(samples.length);
				samples.push([elapsed, point.altitude_meters]);
				connected = true;
			} else {
				connected = false;
			}
		}
	}
	return samples.length >= 2
		? {
				metric: 'elevation',
				unit: 'm',
				samples,
				...(segmentStarts.length ? { segmentStarts } : {})
			}
		: undefined;
}
