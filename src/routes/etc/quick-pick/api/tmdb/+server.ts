import { TMDB_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { MovieMetadata } from '../../workers';

type TMDBSearchResult = {
    id: number;
    title: string;
    release_date: string;
    genre_ids: number[];
    poster_path: string | null;
    overview: string;
    origin_country: string[];
    original_language: string;
};

type TMDBSearchResponse = {
    results: TMDBSearchResult[];
    total_results: number;
};

// TMDB genre ID to name mapping
const GENRE_MAP: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
};

export const GET: RequestHandler = async ({ url }) => {
    const query = url.searchParams.get('q');

    if (!query) {
        return json({ results: [] });
    }

    if (!TMDB_API_KEY) {
        return json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    const searchUrl = new URL('https://api.themoviedb.org/3/search/movie');
    searchUrl.searchParams.set('api_key', TMDB_API_KEY);
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('include_adult', 'false');

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
        return json({ error: 'TMDB API error' }, { status: response.status });
    }

    const data: TMDBSearchResponse = await response.json();

    const searchResults = data.results.slice(0, 10);

    // TMDB's search endpoint doesn't include origin_country, so fetch it in parallel
    const originCountries = await Promise.all(
        searchResults.map(async (movie) => {
            try {
                const r = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`);
                if (!r.ok) return undefined;
                const details: { origin_country?: string[] } = await r.json();
                return details.origin_country?.[0];
            } catch {
                return undefined;
            }
        })
    );

    const results: MovieMetadata[] = searchResults.map((movie, i) => ({
        tmdbId: movie.id,
        title: movie.title,
        year: movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0,
        genres: movie.genre_ids.map((id) => GENRE_MAP[id] || 'Unknown').filter(Boolean),
        posterPath: movie.poster_path,
        overview: movie.overview,
        originCountry: originCountries[i],
        originalLanguage: movie.original_language,
    }));

    return json({ results });
};
