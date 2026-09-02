import { error } from '@sveltejs/kit';
import { Resvg } from '@resvg/resvg-js';
import { getActivity, CycloneResponseError } from '$lib/cyclone/client.server';
import { rideEmbedDescription } from '$lib/cyclone/embed';
import { date, stats } from '$lib/cyclone/format';
import type { ActivityDetail } from '$lib/cyclone/types';
import type { RequestHandler } from './$types';

const canvas = { width: 1200, height: 630 };
const zoneBuddyCanvas = { width: 1080, height: 1080 };

export const GET: RequestHandler = async ({ fetch, params }) => {
	let activity: ActivityDetail;
	try {
		activity = await getActivity(fetch, params.id);
	} catch (cause) {
		if (cause instanceof CycloneResponseError && cause.status === 404)
			error(404, 'Activity not found');
		error(503, 'The activity feed is temporarily unavailable');
	}

	const urls = [
		activity.route_snapshot_url,
		...activity.photos
			.filter((photo) => photo.status === 'ready')
			.slice(0, 3)
			.map((photo) => photo.thumbnail_url || photo.feed_url)
	];
	const images = await Promise.all(urls.map((url) => (url ? imageData(fetch, url) : undefined)));
	const size = activity.share_image_style === 'zonebuddy' ? zoneBuddyCanvas : canvas;
	const svg =
		activity.share_image_style === 'zonebuddy'
			? zoneBuddyCard(activity, images)
			: rideCard(activity, images);
	const png = new Resvg(svg, { fitTo: { mode: 'width', value: size.width } }).render().asPng();
	return new Response(Uint8Array.from(png), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, max-age=300, s-maxage=3600',
			'x-content-type-options': 'nosniff'
		}
	});
};

async function imageData(fetcher: typeof fetch, value: string) {
	try {
		const url = new URL(value);
		if (url.protocol !== 'https:') return undefined;
		const response = await fetcher(url, { signal: AbortSignal.timeout(4_000) });
		const type = response.headers.get('content-type')?.split(';')[0];
		const length = Number(response.headers.get('content-length') || 0);
		if (!response.ok || !type?.startsWith('image/') || length > 8_000_000) return undefined;
		const bytes = await response.arrayBuffer();
		if (bytes.byteLength > 8_000_000) return undefined;
		return `data:${type};base64,${Buffer.from(bytes).toString('base64')}`;
	} catch {
		return undefined;
	}
}

function rideCard(activity: ActivityDetail, images: (string | undefined)[]) {
	const summary = stats(activity.metrics, 'en-US').slice(0, 3);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
		<rect width="1200" height="630" fill="#0b1822"/><rect width="500" height="630" fill="#0f766e"/>
		<text x="48" y="78" fill="white" font-family="Arial, sans-serif" font-size="42" font-weight="700">${text(activity.title, 36)}</text>
		<text x="48" y="132" fill="#d5f4ef" font-family="Arial, sans-serif" font-size="24">${text(rideEmbedDescription(activity), 66)}</text>
		${summary
			.map(
				(
					item,
					index
				) => `<text x="48" y="${260 + index * 80}" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="700">${text(item.value, 20)}</text>
				<text x="48" y="${290 + index * 80}" fill="#d5f4ef" font-family="Arial, sans-serif" font-size="18">${text(item.label.toUpperCase(), 22)}</text>`
			)
			.join('')}
		<text x="48" y="580" fill="#d5f4ef" font-family="Arial, sans-serif" font-size="18" letter-spacing="3">CYCLONE</text>
		${image(images[0], 530, 30, 640, 350, 'Route map')}
		${image(images[1], 530, 400, 207, 200, 'Ride photo')}
		${image(images[2], 746, 400, 207, 200, 'Ride photo')}
		${image(images[3], 962, 400, 208, 200, 'Ride photo')}
	</svg>`;
}

function zoneBuddyCard(activity: ActivityDetail, images: (string | undefined)[]) {
	const summary = stats(activity.metrics, 'en-US').slice(0, 3);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
		<rect width="1080" height="1080" fill="#e5f4f2"/><rect width="1080" height="260" fill="#b7ded9"/>
		<text x="56" y="82" fill="#14312f" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="44" font-weight="700">${text(activity.title, 37)}</text>
		<text x="56" y="154" fill="#375854" font-family="Arial, sans-serif" font-size="28">${text(date(activity.local_date, 'en-US'), 48)}</text>
		<text x="56" y="350" fill="#0f766e" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="138" font-weight="700">${text(summary.find((item) => item.label === 'time')?.value || 'RIDE', 12)}</text>
		${summary
			.filter((item) => item.label !== 'time')
			.slice(0, 2)
			.map(
				(
					item,
					index
				) => `<rect x="${56 + index * 312}" y="450" width="290" height="150" rx="18" fill="white"/>
				<text x="${78 + index * 312}" y="490" fill="#4d6a67" font-family="Arial, sans-serif" font-size="18">${text(item.label.toUpperCase(), 22)}</text>
				<text x="${78 + index * 312}" y="550" fill="#14312f" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="42" font-weight="700">${text(item.value, 18)}</text>`
			)
			.join('')}
		${image(images[0], 56, 660, 600, 300, 'Route map')}
		${image(images[1], 680, 660, 164, 145, 'Ride photo')}
		${image(images[2], 860, 660, 164, 145, 'Ride photo')}
		${image(images[3], 680, 822, 344, 138, 'Ride photo')}
		<text x="56" y="1020" fill="#0f766e" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-size="28" font-weight="700">ZONEBUDDY</text>
		<text x="56" y="1056" fill="#4d6a67" font-family="Arial, sans-serif" font-size="17" letter-spacing="2">RIDE SUMMARY · CYCLONE</text>
	</svg>`;
}

function image(
	source: string | undefined,
	x: number,
	y: number,
	width: number,
	height: number,
	label: string
) {
	if (!source)
		return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="#1e333f"/>
			<text x="${x + 22}" y="${y + 40}" fill="#adcfc9" font-family="Arial, sans-serif" font-size="20">${label}</text>`;
	return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice"><image href="${source}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/></svg>`;
}

function text(value: string, limit: number) {
	const clipped = value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
	return clipped
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
