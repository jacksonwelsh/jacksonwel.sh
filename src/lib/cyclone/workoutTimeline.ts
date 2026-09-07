import type { ActivityInterval } from './types';

export function workoutTimeline(intervals: ActivityInterval[]) {
	let elapsed = 0;
	return intervals
		.filter(
			(interval) =>
				Number.isFinite(Number(interval.duration_seconds)) && Number(interval.duration_seconds) > 0
		)
		.map((interval) => {
			const start = elapsed;
			elapsed += Number(interval.duration_seconds) * 1000;
			return { interval, start, end: elapsed };
		});
}

export function intervalAt(
	timeline: ReturnType<typeof workoutTimeline>,
	position: number | undefined
) {
	if (position === undefined) return undefined;
	const index = timeline.findIndex(
		({ start, end }, index) =>
			position >= start && (position < end || (index === timeline.length - 1 && position === end))
	);
	return index < 0 ? undefined : index;
}
