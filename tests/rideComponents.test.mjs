import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';

test('ride components keep targets separate, show measured zones, and use summary cadence', async () => {
	const server = await createServer({
		server: { middlewareMode: true, hmr: false },
		appType: 'custom'
	});
	try {
		const { render } = await server.ssrLoadModule('svelte/server');
		const { default: Structure } = await server.ssrLoadModule(
			'/src/lib/cyclone/WorkoutStructure.svelte'
		);
		const { default: Chart } = await server.ssrLoadModule('/src/lib/cyclone/MetricChart.svelte');
		const powerTimeSeconds = { 1: 30, 2: 60, 3: 10, 4: 0, 5: 0, 6: 0, 7: 0 };
		const unstructured = render(Structure, {
			props: { intervals: [], zones: {}, powerTimeSeconds }
		}).body;
		assert.match(unstructured, /Time in zones/);
		assert.match(unstructured, /1m/);
		assert.doesNotMatch(unstructured, /Zone targets met/);
		const structured = render(Structure, {
			props: {
				intervals: [{ power_zone: 2, duration_seconds: 100 }],
				zones: { power_seconds: { 2: 80 } },
				isZoneBuddy: true,
				durationSeconds: 100,
				powerTimeSeconds
			}
		}).body;
		assert.match(structured, /Zone targets met/);
		assert.doesNotMatch(structured, /Time in zones/);
		const cadence = {
			metric: 'cadence',
			unit: 'rpm',
			samples: [
				[0, 0],
				[1000, 60],
				[2000, 100]
			]
		};
		const average = render(Chart, {
			props: { stream: cadence, locale: 'en-US', summaryAverage: 87 }
		}).body;
		assert.match(average, /87\s+rpm/);
		const fallback = render(Chart, { props: { stream: cadence, locale: 'en-US' } }).body;
		assert.match(fallback, /80\s+rpm/);
		const hover = render(Chart, {
			props: {
				stream: {
					metric: 'power',
					unit: 'W',
					samples: [
						[0, 0],
						[1000, 200]
					]
				},
				locale: 'en-US',
				hoverPosition: 1000,
				powerZoneBounds: [110, 150, 180, 210, 240, 300]
			}
		}).body;
		assert.match(hover, /Z4 · Threshold/);
	} finally {
		await server.close();
	}
});
