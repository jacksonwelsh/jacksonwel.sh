import assert from 'node:assert/strict';
import { test } from 'node:test';
import { zoneTargets } from '../src/lib/cyclone/zoneTargets.ts';

test('uses each cued zone as its denominator and includes missed targets', () => {
	assert.deepEqual(
		zoneTargets(
			[
				{ power_zone: 3, duration_seconds: 120 },
				{ power_zone: 1, duration_seconds: 60 },
				{ power_zone: 3, duration_seconds: 60 },
				{ power_zone: 5, duration_seconds: 30 }
			],
			{ power_seconds: { '1': 60, '3': 90 } },
			270
		),
		[
			{ zone: 1, seconds: 60, scheduledSeconds: 60, percent: 100 },
			{ zone: 3, seconds: 90, scheduledSeconds: 180, percent: 50 },
			{ zone: 5, seconds: 0, scheduledSeconds: 30, percent: 0 }
		]
	);
});

test('excludes uncued time and intervals after an early finish', () => {
	assert.deepEqual(
		zoneTargets(
			[
				{ power_zone: null, duration_seconds: 30 },
				{ power_zone: 2, duration_seconds: 120 },
				{ power_zone: 4, duration_seconds: 60 }
			],
			{ power_seconds: { '2': 30, '4': 0 } },
			90
		),
		[{ zone: 2, seconds: 30, scheduledSeconds: 60, percent: 50 }]
	);
});

test('keeps all-zero targets visible and caps percentages like ZoneBuddy', () => {
	assert.deepEqual(zoneTargets([{ power_zone: 1, duration_seconds: 60 }], {}, undefined), [
		{ zone: 1, seconds: 0, scheduledSeconds: 60, percent: 0 }
	]);
	assert.deepEqual(
		zoneTargets([{ power_zone: 1, duration_seconds: 60 }], { power_seconds: { '1': 61 } }, 60),
		[{ zone: 1, seconds: 61, scheduledSeconds: 60, percent: 100 }]
	);
});

test('does not invent targets for unstructured rides or invalid intervals', () => {
	assert.deepEqual(zoneTargets([], { power_seconds: { '2': 100 } }, 100), []);
	assert.deepEqual(
		zoneTargets(
			[
				{},
				{ power_zone: 1, duration_seconds: Infinity },
				{ power_zone: 1, duration_seconds: 0 },
				{ power_zone: 1, duration_seconds: -1 },
				{ power_zone: 1.5, duration_seconds: 10 },
				{ power_zone: 8, duration_seconds: 10 }
			],
			{},
			100
		),
		[]
	);
	assert.deepEqual(zoneTargets([{ power_zone: 1, duration_seconds: 10 }], {}, 0), []);
});
