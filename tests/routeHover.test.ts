import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routePositionAt, timedElevation } from '../src/lib/cyclone/routeHover.ts';

const point = (time?: number, latitude = 10, longitude = 20) => ({
	latitude,
	longitude,
	elapsed_milliseconds: time
});
const segments = [
	[point(1000), point(3000, 12, 22)],
	[point(7000, 30, 40), point(9000, 32, 42)]
];

test('tracks graph time within visible segments and includes their endpoints', () => {
	assert.deepEqual(routePositionAt(segments, 2000), { latitude: 11, longitude: 21 });
	assert.deepEqual(routePositionAt(segments, 8000), { latitude: 31, longitude: 41 });
	for (const segment of segments)
		for (const p of segment) assert.equal(routePositionAt(segments, p.elapsed_milliseconds), p);
});

test('hides the marker outside the route, on hover leave, and across privacy gaps', () => {
	for (const time of [undefined, NaN, Infinity, -1, 0, 4000, 6000, 10000])
		assert.equal(routePositionAt(segments, time), undefined);
	assert.equal(routePositionAt([], 1000), undefined);
});

test('never bridges absent or invalid timing', () => {
	for (const time of [undefined, NaN, Infinity, -1]) {
		const route = [[point(1000), point(time), point(3000)]];
		assert.equal(routePositionAt(route, 2000), undefined);
	}
	assert.equal(routePositionAt([[point(3000), point(1000)]], 2000), undefined);
	assert.equal(routePositionAt([[point(1000), point(1000)]], 2000), undefined);
});

test('crosses the antimeridian by the short direction', () => {
	assert.deepEqual(routePositionAt([[point(0, 0, 179), point(2000, 0, -179)]], 1000), {
		latitude: 0,
		longitude: -180
	});
});

test('uses actual route timing for elevation and omits untimed points', () => {
	assert.deepEqual(
		timedElevation([
			[
				{ ...point(1000), altitude_meters: 10 },
				{ ...point(), altitude_meters: 20 },
				{ ...point(7000), altitude_meters: 30 },
				point(8000),
				{ ...point(-1), altitude_meters: 0 },
				{ ...point(Infinity), altitude_meters: 0 },
				{ ...point(9000), altitude_meters: NaN }
			]
		]),
		{
			metric: 'elevation',
			unit: 'm',
			segmentStarts: [1],
			samples: [
				[1000, 10],
				[7000, 30]
			]
		}
	);
	assert.equal(timedElevation([]), undefined);
	assert.equal(timedElevation([[{ ...point(0), altitude_meters: 10 }]]), undefined);
});
