#!/usr/bin/env node
// Snapshots prediction-market data into static/betdle.json for the Betdle game.
//
// Tries to pull real markets + price history from Polymarket's public APIs. If the network is
// unavailable (e.g. the host isn't on an egress allowlist), it falls back to a deterministic
// synthetic seed so the game is always playable. Re-running is idempotent.
//
// Usage:
//   node scripts/fetch-betdle.mjs            # try real data, fall back to seed
//   node scripts/fetch-betdle.mjs --seed     # force the synthetic seed
//
// Output schema (array): see src/routes/betdle/index.ts (Market type).

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Kept under src/ (not static/) so it's bundled server-side only and never served at a public
// URL — otherwise a player could fetch it and match the rendered odds curve to its title.
const OUT = join(__dirname, '..', 'src', 'lib', 'data', 'betdle.json');

const TARGET_COUNT = 40; // how many markets to include
const MAX_POINTS = 90; // downsample each series to at most this many points

// ---------------------------------------------------------------------------
// Deterministic RNG (mulberry32) so the synthetic seed is stable across runs.
// ---------------------------------------------------------------------------
function strHash(str) {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	return h >>> 0;
}

function mulberry32(seed) {
	let a = seed >>> 0;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const clampProb = (p) => Math.max(0.02, Math.min(0.98, p));

// Generate a realistic-looking random-walk odds curve that drifts toward `endProb`.
function generateSeries(seedStr, startProb, endProb, resolutionDate, days = 60, volatility = 0.06) {
	const rand = mulberry32(strHash(seedStr));
	const n = Math.min(MAX_POINTS, days);
	const end = Date.parse(resolutionDate) / 1000;
	const span = days * 24 * 60 * 60;
	const series = [];
	let p = startProb;
	for (let i = 0; i < n; i++) {
		const frac = i / (n - 1);
		// pull toward the eventual value, plus noise
		const target = startProb + (endProb - startProb) * frac;
		p += (target - p) * 0.25 + (rand() - 0.5) * volatility;
		p = clampProb(p);
		const t = Math.round(end - span + frac * span);
		series.push({ t, p: Number(p.toFixed(4)) });
	}
	// snap the final point to the resolved-ish value
	series[series.length - 1].p = Number(clampProb(endProb).toFixed(4));
	return series;
}

// ---------------------------------------------------------------------------
// Synthetic seed: a small, varied, playable pool spanning several categories.
// Replaced wholesale once the real fetch works.
// ---------------------------------------------------------------------------
const SEED_DEFS = [
	{
		id: 's-uspres-2024',
		platform: 'polymarket',
		title: 'Will the Republican nominee win the 2024 US presidential election?',
		category: 'Politics',
		subcategory: 'US Elections',
		resolutionDate: '2024-11-05',
		volume: 412_000_000,
		start: 0.48,
		end: 0.62,
		vol: 0.05
	},
	{
		id: 's-senate-2024',
		platform: 'polymarket',
		title: 'Will Republicans win control of the US Senate in 2024?',
		category: 'Politics',
		subcategory: 'US Elections',
		resolutionDate: '2024-11-05',
		volume: 38_000_000,
		start: 0.5,
		end: 0.72,
		vol: 0.05
	},
	{
		id: 's-celtics-2024',
		platform: 'kalshi',
		title: 'Will the Boston Celtics win the 2024 NBA Championship?',
		category: 'Sports',
		subcategory: 'Basketball',
		resolutionDate: '2024-06-23',
		volume: 9_400_000,
		start: 0.32,
		end: 0.95,
		vol: 0.07
	},
	{
		id: 's-copa-2024',
		platform: 'polymarket',
		title: 'Will Argentina win the 2024 Copa América?',
		category: 'Sports',
		subcategory: 'Soccer',
		resolutionDate: '2024-07-14',
		volume: 6_100_000,
		start: 0.28,
		end: 0.9,
		vol: 0.08
	},
	{
		id: 's-btc-100k',
		platform: 'polymarket',
		title: 'Will Bitcoin reach $100,000 by the end of 2024?',
		category: 'Crypto',
		subcategory: 'Bitcoin',
		resolutionDate: '2024-12-31',
		volume: 54_000_000,
		start: 0.2,
		end: 0.55,
		vol: 0.09
	},
	{
		id: 's-eth-etf',
		platform: 'polymarket',
		title: 'Will a spot Ethereum ETF be approved in 2024?',
		category: 'Crypto',
		subcategory: 'Ethereum',
		resolutionDate: '2024-12-31',
		volume: 21_000_000,
		start: 0.15,
		end: 0.92,
		vol: 0.1
	},
	{
		id: 's-hottest-2024',
		platform: 'kalshi',
		title: 'Will 2024 be the hottest year on record?',
		category: 'Weather',
		subcategory: 'Climate',
		resolutionDate: '2025-01-15',
		volume: 2_300_000,
		start: 0.55,
		end: 0.96,
		vol: 0.05
	},
	{
		id: 's-fed-sept',
		platform: 'kalshi',
		title: 'Will the Fed cut interest rates in September 2024?',
		category: 'Economics',
		subcategory: 'Monetary Policy',
		resolutionDate: '2024-09-18',
		volume: 14_500_000,
		start: 0.4,
		end: 0.99,
		vol: 0.06
	},
	{
		id: 's-oppenheimer',
		platform: 'polymarket',
		title: "Will 'Oppenheimer' win Best Picture at the 2024 Oscars?",
		category: 'Pop Culture',
		subcategory: 'Awards',
		resolutionDate: '2024-03-10',
		volume: 4_800_000,
		start: 0.6,
		end: 0.94,
		vol: 0.05
	},
	{
		id: 's-starship-orbit',
		platform: 'polymarket',
		title: 'Will SpaceX Starship reach orbit in 2024?',
		category: 'Science',
		subcategory: 'Space',
		resolutionDate: '2024-12-31',
		volume: 3_200_000,
		start: 0.45,
		end: 0.82,
		vol: 0.08
	},
	{
		id: 's-gpt5',
		platform: 'polymarket',
		title: 'Will OpenAI release GPT-5 in 2024?',
		category: 'Technology',
		subcategory: 'AI',
		resolutionDate: '2024-12-31',
		volume: 7_900_000,
		start: 0.5,
		end: 0.12,
		vol: 0.07
	},
	{
		id: 's-recession-2024',
		platform: 'kalshi',
		title: 'Will the US enter a recession in 2024?',
		category: 'Economics',
		subcategory: 'Macro',
		resolutionDate: '2024-12-31',
		volume: 11_200_000,
		start: 0.35,
		end: 0.08,
		vol: 0.06
	}
];

function buildSeed() {
	return SEED_DEFS.map((d) => ({
		id: d.id,
		platform: d.platform,
		title: d.title,
		category: d.category,
		subcategory: d.subcategory,
		resolutionDate: d.resolutionDate,
		volume: d.volume,
		currentProbability: clampProb(d.end),
		series: generateSeries(d.id, d.start, d.end, d.resolutionDate, 60, d.vol)
	}));
}

// ---------------------------------------------------------------------------
// Real data: Polymarket Gamma (metadata) + CLOB (price history).
// ---------------------------------------------------------------------------
const GAMMA = 'https://gamma-api.polymarket.com';
const CLOB = 'https://clob.polymarket.com';

function downsample(history) {
	if (history.length <= MAX_POINTS) return history;
	const step = history.length / MAX_POINTS;
	const out = [];
	for (let i = 0; i < MAX_POINTS; i++) out.push(history[Math.floor(i * step)]);
	out[out.length - 1] = history[history.length - 1];
	return out;
}

async function getJson(url) {
	const res = await fetch(url, { headers: { accept: 'application/json' } });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
	return res.json();
}

async function fetchPolymarket() {
	// Pull recently-closed, high-volume markets so the curves are complete.
	const markets = await getJson(
		`${GAMMA}/markets?closed=true&limit=${TARGET_COUNT * 3}&order=volumeNum&ascending=false`
	);

	const out = [];
	for (const m of markets) {
		if (out.length >= TARGET_COUNT) break;
		try {
			const question = m.question || m.title;
			const clobTokenIds = JSON.parse(m.clobTokenIds || '[]');
			const yesToken = clobTokenIds[0];
			if (!question || !yesToken) continue;

			const hist = await getJson(
				`${CLOB}/prices-history?market=${yesToken}&interval=max&fidelity=720`
			);
			const history = (hist.history || []).map((h) => ({ t: h.t, p: Number(h.p) }));
			if (history.length < 8) continue;

			const tags = (m.events?.[0]?.tags || m.tags || [])
				.map((t) => t.label || t.name)
				.filter(Boolean);
			out.push({
				id: m.id || m.conditionId || yesToken,
				platform: 'polymarket',
				title: question,
				category: m.category || tags[0] || 'Other',
				subcategory: tags[1] || null,
				resolutionDate: (m.endDate || m.endDateIso || '').slice(0, 10),
				volume: Math.round(Number(m.volumeNum || m.volume || 0)),
				currentProbability: clampProb(history[history.length - 1].p),
				series: downsample(history),
				url: m.slug ? `https://polymarket.com/event/${m.slug}` : undefined
			});
		} catch (err) {
			// skip individual market failures
			console.warn(`  skipped a market: ${err.message}`);
		}
	}
	return out;
}

// ---------------------------------------------------------------------------
async function main() {
	const forceSeed = process.argv.includes('--seed');
	let data;

	if (forceSeed) {
		console.log('Building synthetic seed (--seed).');
		data = buildSeed();
	} else {
		try {
			console.log('Fetching real markets from Polymarket…');
			data = await fetchPolymarket();
			if (data.length < 8) throw new Error(`only got ${data.length} usable markets`);
			console.log(`Fetched ${data.length} markets.`);
		} catch (err) {
			console.warn(`\nReal fetch failed (${err.message}).`);
			console.warn('Falling back to synthetic seed — re-run once the API hosts are allowlisted.');
			data = buildSeed();
		}
	}

	await writeFile(OUT, JSON.stringify(data, null, '\t') + '\n');
	console.log(`Wrote ${data.length} markets to ${OUT}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
