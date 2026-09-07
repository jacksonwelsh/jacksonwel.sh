import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeActivityPage } from '../src/lib/cyclone/feed.ts';
import type { ActivityDetail } from '../src/lib/cyclone/types.ts';

test('feed payload excludes detail data while preserving cards, order, and pagination', () => {
	const activity: ActivityDetail = {
		id: 'ride-1',
		canonical_url: 'https://example.com/ride/ride-1',
		type: 'outdoor_ride',
		virtual: false,
		title: 'Morning ride',
		description_html: '<p>A ride around the lake.</p>',
		local_date: '2026-09-07',
		metrics: { distance_meters: 12000 },
		route_snapshot_url: 'https://example.com/map.png',
		route_snapshot_dark_url: 'https://example.com/map-dark.png',
		share_image_url: 'https://example.com/share.png',
		share_image_style: 'zonebuddy',
		photos: [
			{ id: 'photo-1', sort_order: 0, cover: true, status: 'ready', feed_url: '/photo.jpg' }
		],
		route_segments: [[{ latitude: 47, longitude: -122 }]],
		laps: [{ distance_meters: 1000 }],
		intervals: [{ duration_seconds: 60 }],
		zones: { power_seconds: { '1': 60 } }
	};
	const page = { activities: [activity, { ...activity, id: 'ride-2' }], next_cursor: 'page-two' };
	const before = structuredClone(page);
	const result = summarizeActivityPage(page);
	const { route_segments, laps, intervals, zones, ...summary } = activity;
	assert.deepEqual(result, {
		activities: [summary, { ...summary, id: 'ride-2' }],
		next_cursor: 'page-two'
	});
	assert.deepEqual(page, before);
	assert.ok(!JSON.stringify(result).includes('route_segments'));
});

test('empty feed has no next page', () => {
	assert.deepEqual(summarizeActivityPage({ activities: [] }), {
		activities: [],
		next_cursor: undefined
	});
});
