# ZoneBuddy Strava OAuth proxy

Keeps the Strava **client secret** server-side so it never ships in the iOS app
binary. Two endpoints:

- `GET /zonebuddy/strava/callback` — Strava redirects here after the user
  authorizes. Exchanges the one-time `code` for tokens, then 302-redirects the
  in-app browser to `zonebuddy://strava/connected#…` with the tokens in the URL
  fragment.
- `POST /zonebuddy/strava/refresh` — body `{ "refresh_token": "…" }`. Returns a
  fresh `{ access_token, refresh_token, expires_at }`.

## Required env vars

Set these as private env (e.g. `.env`, not committed). They're read at runtime
via `$env/dynamic/private`, so they only need to be present in the deployed
server's environment — not at build time:

```
STRAVA_CLIENT_ID=<your numeric client id>
STRAVA_CLIENT_SECRET=<your client secret>
```

## Strava API application settings

In <https://www.strava.com/settings/api>:

- **Authorization Callback Domain**: `jacksonwel.sh`

The iOS app sends `redirect_uri=https://jacksonwel.sh/zonebuddy/strava/callback`
in its authorize request, and requests scopes `read,activity:write`.
