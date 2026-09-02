import type { ActivityType, Metrics } from './types';

export const activityName: Record<ActivityType, string> = {
	outdoor_ride: 'outdoor ride',
	indoor_ride: 'indoor ride',
	run: 'run',
	walk: 'walk',
	hike: 'hike'
};

const region = (locale: string) => {
	try {
		return new Intl.Locale(locale).maximize().region;
	} catch {
		return 'US';
	}
};

export const usesMiles = (locale: string) =>
	['US', 'GB', 'LR', 'MM'].includes(region(locale) ?? '');

export const localeFromHeader = (acceptLanguage: string | null) => {
	const candidate = acceptLanguage?.split(',')[0]?.split(';')[0]?.trim();
	if (!candidate) return 'en-US';
	try {
		return Intl.getCanonicalLocales(candidate)[0] ?? 'en-US';
	} catch {
		return 'en-US';
	}
};

export const date = (value: string, locale = 'en-US') =>
	new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
		new Date(`${value}T12:00:00Z`)
	);

export const duration = (seconds?: number) => {
	if (seconds == null) return undefined;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const localizedDistance = (meters: number, locale: string) => {
	const value = usesMiles(locale) ? meters / 1609.344 : meters / 1000;
	const unit = usesMiles(locale) ? 'mi' : 'km';
	return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)} ${unit}`;
};

const localizedElevation = (meters: number, locale: string) => {
	const value = usesMiles(locale) ? meters * 3.28084 : meters;
	const unit = usesMiles(locale) ? 'ft' : 'm';
	return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} ${unit}`;
};

const localizedSpeed = (metersPerSecond: number, locale: string) => {
	const value = usesMiles(locale) ? metersPerSecond * 2.236936 : metersPerSecond * 3.6;
	const unit = usesMiles(locale) ? 'mph' : 'km/h';
	return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} ${unit}`;
};

export const stats = (metrics: Metrics, locale = 'en-US') =>
	[
		metrics.distance_meters == null
			? undefined
			: { label: 'distance', value: localizedDistance(metrics.distance_meters, locale) },
		duration(metrics.moving_duration_seconds ?? metrics.duration_seconds) == null
			? undefined
			: {
					label: 'time',
					value: duration(metrics.moving_duration_seconds ?? metrics.duration_seconds)!
				},
		metrics.elevation_gain_meters == null
			? undefined
			: { label: 'elevation', value: localizedElevation(metrics.elevation_gain_meters, locale) },
		metrics.average_power_watts == null
			? undefined
			: { label: 'power', value: `${Math.round(metrics.average_power_watts)} W` }
	].filter((item): item is { label: string; value: string } => item != null);

export const detailStats = (metrics: Metrics, locale = 'en-US', type?: ActivityType) => {
	if (type !== 'outdoor_ride') return stats(metrics, locale);
	return [
		metrics.distance_meters == null
			? undefined
			: { label: 'distance', value: localizedDistance(metrics.distance_meters, locale) },
		duration(metrics.moving_duration_seconds ?? metrics.duration_seconds) == null
			? undefined
			: {
					label: 'time',
					value: duration(metrics.moving_duration_seconds ?? metrics.duration_seconds)!
				},
		metrics.average_speed_mps == null
			? undefined
			: { label: 'avg speed', value: localizedSpeed(metrics.average_speed_mps, locale) },
		metrics.maximum_speed_mps == null
			? undefined
			: { label: 'max speed', value: localizedSpeed(metrics.maximum_speed_mps, locale) },
		metrics.elevation_gain_meters == null
			? undefined
			: { label: 'elevation', value: localizedElevation(metrics.elevation_gain_meters, locale) },
		metrics.average_power_watts == null
			? undefined
			: { label: 'avg power', value: `${Math.round(metrics.average_power_watts)} W` },
		metrics.average_heart_rate_bpm == null
			? undefined
			: { label: 'avg heart rate', value: `${Math.round(metrics.average_heart_rate_bpm)} bpm` },
		metrics.average_cadence_rpm == null
			? undefined
			: { label: 'avg cadence', value: `${Math.round(metrics.average_cadence_rpm)} rpm` },
		metrics.active_energy_kcal == null
			? undefined
			: { label: 'energy', value: `${Math.round(metrics.active_energy_kcal)} kcal` },
		metrics.work_kilojoules == null
			? undefined
			: { label: 'work', value: `${Math.round(metrics.work_kilojoules)} kJ` }
	].filter((item): item is { label: string; value: string } => item != null);
};

export const textExcerpt = (html: string, limit = 180) => {
	const plain = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return plain.length > limit ? `${plain.slice(0, limit).trimEnd()}…` : plain;
};
