import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hoveredPowerZone } from '../src/lib/cyclone/powerZones.ts';

test('hover follows inclusive API boundaries, including zero and unlimited zone 7', () => {
	const bounds = [110, 150, 180, 210, 240, 300];
	for (const [power, expected] of [
		[0, 1],
		[110, 1],
		[111, 2],
		[150, 2],
		[180, 3],
		[210, 4],
		[240, 5],
		[300, 6],
		[301, 7],
		[1000, 7]
	]) {
		assert.equal(hoveredPowerZone(power, bounds), expected);
	}
	assert.equal(hoveredPowerZone(-1, bounds), undefined);
	assert.equal(hoveredPowerZone(100, undefined), undefined);
});
