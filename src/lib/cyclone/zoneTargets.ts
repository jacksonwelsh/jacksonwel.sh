import type { ActivityInterval, ActivityZones } from './types';

export function zoneTargets(
	intervals: ActivityInterval[],
	zones: ActivityZones,
	durationSeconds: number | undefined
) {
	const scheduled = new Map<number, number>();
	let remaining = durationSeconds ?? Infinity;
	for (const interval of intervals) {
		const duration = Number(interval.duration_seconds);
		if (!Number.isFinite(duration) || duration <= 0) continue;
		const seconds = Math.max(0, Math.min(duration, remaining));
		remaining -= seconds;
		const zone = Number(interval.power_zone);
		if (Number.isInteger(zone) && zone >= 1 && zone <= 7 && seconds > 0) {
			scheduled.set(zone, (scheduled.get(zone) ?? 0) + seconds);
		}
	}

	// ZoneBuddy exports successful target time, not a power-zone distribution.
	// Its elapsed cue counters are not exported; use intervals capped at ride duration.
	return [...scheduled.entries()]
		.sort(([a], [b]) => a - b)
		.map(([zone, scheduledSeconds]) => {
			const seconds = Number(zones.power_seconds?.[zone] ?? 0);
			return {
				zone,
				seconds,
				scheduledSeconds,
				percent: Math.min(seconds / scheduledSeconds, 1) * 100
			};
		});
}
