import type { MetricStream } from './types';

// This is an estimate from the visible profile, not the source's reported ascent.
export function elevationGains(stream: MetricStream, omittedRanges: [number, number][] = []) {
	const starts = new Set(stream.segmentStarts);
	let gain = 0;
	return stream.samples.map(([elapsed, altitude], index) => {
		const previous = stream.samples[index - 1];
		if (
			previous &&
			!starts.has(index) &&
			elapsed > previous[0] &&
			Number.isFinite(altitude) &&
			Number.isFinite(previous[1]) &&
			!omittedRanges.some(([start, end]) => previous[0] < end && elapsed > start)
		) {
			gain += Math.max(altitude - previous[1], 0);
		}
		return gain;
	});
}
