// Shared constants + helpers for the ZoneBuddy Strava OAuth proxy.
//
// The proxy exists so the Strava client secret never ships inside the iOS app
// binary. The app drives the OAuth *authorize* step itself (via
// ASWebAuthenticationSession), Strava redirects the browser to `/callback`
// here, and this server exchanges the one-time code for tokens using the
// secret. Token refresh is likewise proxied so the secret stays server-side.

/** Strava's OAuth token endpoint — used for both the initial code exchange
 *  and subsequent refreshes. */
export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

/** Custom URL scheme the iOS app registers. The callback redirects the
 *  in-app browser here so ASWebAuthenticationSession captures the result. */
export const APP_CALLBACK = 'zonebuddy://strava/connected';

/** Shape of Strava's token response (fields we forward to the app). */
export interface StravaTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_at: number; // unix seconds
	athlete?: {
		id: number;
		firstname?: string;
		lastname?: string;
	};
}

/** Build the app deep-link the browser is redirected to after a successful
 *  (or failed) authorization. Everything rides in the URL fragment so values
 *  never land in the proxy's or any intermediary's request logs. The app
 *  validates `state` before trusting the payload. */
export function appRedirect(fragment: Record<string, string | undefined>): Response {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(fragment)) {
		if (value !== undefined && value !== '') params.set(key, value);
	}
	// Use a raw 302 rather than SvelteKit's `redirect()` so the custom
	// (non-http) scheme is preserved unmodified in the Location header.
	return new Response(null, {
		status: 302,
		headers: { Location: `${APP_CALLBACK}#${params.toString()}` }
	});
}

export function athleteName(athlete: StravaTokenResponse['athlete']): string | undefined {
	if (!athlete) return undefined;
	return [athlete.firstname, athlete.lastname].filter(Boolean).join(' ').trim() || undefined;
}
