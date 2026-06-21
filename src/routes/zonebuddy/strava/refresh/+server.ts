import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STRAVA_TOKEN_URL, type StravaTokenResponse } from '../shared';

// POST /zonebuddy/strava/refresh   body: { refresh_token: string }
//
// Exchanges a refresh token for a fresh access token. The app holds only the
// refresh token (in the Keychain); the client secret required to redeem it
// lives here. Strava rotates refresh tokens, so the app must persist whichever
// `refresh_token` comes back.
export const POST: RequestHandler = async ({ request }) => {
	if (!env.STRAVA_CLIENT_ID || !env.STRAVA_CLIENT_SECRET) {
		return json({ error: 'server_not_configured' }, { status: 500 });
	}

	let refreshToken: string | undefined;
	try {
		const body = (await request.json()) as { refresh_token?: string };
		refreshToken = body.refresh_token;
	} catch {
		return json({ error: 'invalid_body' }, { status: 400 });
	}
	if (!refreshToken) {
		return json({ error: 'missing_refresh_token' }, { status: 400 });
	}

	let tokens: StravaTokenResponse;
	try {
		const response = await fetch(STRAVA_TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				client_id: env.STRAVA_CLIENT_ID,
				client_secret: env.STRAVA_CLIENT_SECRET,
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			})
		});

		if (!response.ok) {
			// 400/401 here means the refresh token was revoked or is invalid —
			// surface the status so the app can prompt a reconnect.
			return json({ error: `strava_${response.status}` }, { status: response.status });
		}
		tokens = (await response.json()) as StravaTokenResponse;
	} catch {
		return json({ error: 'refresh_failed' }, { status: 502 });
	}

	return json({
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
		expires_at: tokens.expires_at
	});
};
