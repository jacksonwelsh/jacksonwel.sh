import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { STRAVA_TOKEN_URL, appRedirect, athleteName, type StravaTokenResponse } from '../shared';

// GET /zonebuddy/strava/callback?code=...&state=...&scope=...
//
// Strava redirects the user's in-app browser here after they approve (or deny)
// access. We exchange the one-time `code` for tokens using the client secret,
// then bounce the browser to the app's custom scheme with the tokens in the URL
// fragment. `state` is round-tripped untouched so the app can verify it.
export const GET: RequestHandler = async ({ url }) => {
	const state = url.searchParams.get('state') ?? undefined;
	const error = url.searchParams.get('error');
	const code = url.searchParams.get('code');

	// User denied, or Strava returned an error.
	if (error) {
		return appRedirect({ error, state });
	}
	if (!code) {
		return appRedirect({ error: 'missing_code', state });
	}
	if (!env.STRAVA_CLIENT_ID || !env.STRAVA_CLIENT_SECRET) {
		return appRedirect({ error: 'server_not_configured', state });
	}

	let tokens: StravaTokenResponse;
	try {
		const response = await fetch(STRAVA_TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				client_id: env.STRAVA_CLIENT_ID,
				client_secret: env.STRAVA_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code'
			})
		});

		if (!response.ok) {
			return appRedirect({ error: `strava_${response.status}`, state });
		}
		tokens = (await response.json()) as StravaTokenResponse;
	} catch {
		return appRedirect({ error: 'exchange_failed', state });
	}

	return appRedirect({
		state,
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
		expires_at: String(tokens.expires_at),
		athlete_id: tokens.athlete ? String(tokens.athlete.id) : undefined,
		athlete_name: athleteName(tokens.athlete)
	});
};
