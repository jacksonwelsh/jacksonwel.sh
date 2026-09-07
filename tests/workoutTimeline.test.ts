import assert from 'node:assert/strict';
import { test } from 'node:test';
import { workoutTimeline, intervalAt } from '../src/lib/cyclone/workoutTimeline.ts';

test('matches elapsed graph milliseconds to intervals, including exact boundaries', () => {
	const timeline = workoutTimeline([
		{ duration_seconds: 600, power_zone: 2 },
		{ duration_seconds: 1200, power_zone: 4 },
		{ duration_seconds: 300, power_zone: 2 }
	]);
	assert.deepEqual(
		timeline.map(({ start, end }) => [start, end]),
		[
			[0, 600000],
			[600000, 1800000],
			[1800000, 2100000]
		]
	);
	for (const [position, expected] of [
		[0, 0],
		[599999, 0],
		[600000, 1],
		[1799999, 1],
		[1800000, 2],
		[2100000, 2]
	] as const) {
		assert.equal(intervalAt(timeline, position), expected);
	}
	for (const position of [undefined, -1, 2100001, NaN, Infinity]) {
		assert.equal(intervalAt(timeline, position), undefined);
	}
});

test('ignores invalid durations without shifting valid intervals and supports empty rides', () => {
	const interval = { duration_seconds: 30 };
	assert.deepEqual(
		workoutTimeline([
			{},
			{ duration_seconds: 0 },
			{ duration_seconds: -2 },
			{ duration_seconds: Infinity },
			{ duration_seconds: NaN },
			interval
		]),
		[{ interval, start: 0, end: 30000 }]
	);
	assert.deepEqual(workoutTimeline([]), []);
	assert.equal(intervalAt([], 0), undefined);
});
