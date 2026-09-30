import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stats, detailStats } from '../src/lib/cyclone/format.ts';

test('list shows mechanical energy in kJ, preserving detail power and output', () => {
	const metrics = { average_power_watts: 123, work_kilojoules: 456.7, active_energy_kcal: 600 };
	assert.deepEqual(stats(metrics), [{ label: 'energy', value: '457 kJ' }]);
	assert.deepEqual(detailStats(metrics, 'en-US', 'indoor_ride'), [
		{ label: 'power', value: '123 W' },
		{ label: 'output', value: '457 kJ' }
	]);
	assert.deepEqual(stats({ average_power_watts: 123 }), []);
	assert.deepEqual(stats({ work_kilojoules: 0 }), [{ label: 'energy', value: '0 kJ' }]);
});
