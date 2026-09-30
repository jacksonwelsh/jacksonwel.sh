import assert from 'node:assert/strict';
import { test } from 'node:test';
import { elevationGains } from '../src/lib/cyclone/elevationGain.ts';
import { timedElevation } from '../src/lib/cyclone/routeHover.ts';

test('cumulative elevation excludes descents, route gaps, and missing altitudes', () => {
	const point = (elapsed: number, altitude?: number) => ({
		latitude: 0,
		longitude: 0,
		elapsed_milliseconds: elapsed,
		altitude_meters: altitude
	});
	const stream = timedElevation([
		[point(0, 10), point(1000, 20), point(2000, 15)],
		[point(5000, 100), point(6000, 110), point(7000), point(8000, 200), point(9000, 205)]
	])!;
	assert.deepEqual(elevationGains(stream), [0, 10, 10, 10, 20, 20, 25]);
});

test('cumulative elevation excludes climbs across pauses including exact endpoints', () => {
	assert.deepEqual(
		elevationGains(
			{
				metric: 'elevation',
				unit: 'm',
				samples: [
					[0, 0],
					[1000, 10],
					[2000, 20],
					[3000, 100],
					[4000, 105]
				]
			},
			[[1000, 3000]]
		),
		[0, 10, 10, 10, 15]
	);
});

test('duplicate times, invalid altitudes, and empty profiles do not create gain', () => {
	assert.deepEqual(
		elevationGains({
			metric: 'elevation',
			unit: 'm',
			samples: [
				[0, 0],
				[0, 100],
				[1000, NaN],
				[2000, 200],
				[3000, 205]
			]
		}),
		[0, 0, 0, 0, 5]
	);
	assert.deepEqual(elevationGains({ metric: 'elevation', unit: 'm', samples: [] }), []);
});
