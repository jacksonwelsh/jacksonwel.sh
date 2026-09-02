import { activityName, date, stats } from './format';
import type { ActivitySummary } from './types';

export const rideEmbedDescription = (activity: ActivitySummary, locale = 'en-US') => {
	const summary = stats(activity.metrics, locale)
		.slice(0, 3)
		.map((item) => item.value)
		.join(' · ');
	return [activityName[activity.type], date(activity.local_date, locale), summary]
		.filter(Boolean)
		.join(' · ');
};
