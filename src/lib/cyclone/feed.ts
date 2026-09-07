import type { ActivityPage } from './types';

// The API also returns route coordinates. Keep detail data out of feed hydration.
export const summarizeActivityPage = (page: ActivityPage): ActivityPage => ({
	next_cursor: page.next_cursor,
	activities: page.activities.map((activity) => ({
		id: activity.id,
		canonical_url: activity.canonical_url,
		type: activity.type,
		virtual: activity.virtual,
		title: activity.title,
		description_html: activity.description_html,
		local_date: activity.local_date,
		metrics: activity.metrics,
		route_snapshot_url: activity.route_snapshot_url,
		route_snapshot_dark_url: activity.route_snapshot_dark_url,
		share_image_url: activity.share_image_url,
		share_image_style: activity.share_image_style,
		photos: activity.photos
	}))
});
