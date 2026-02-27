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

    const results: MovieMetadata[] = data.results.slice(0, 10).map((movie) => ({
        tmdbId: movie.id,
        title: movie.title,
        year: movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0,
        genres: movie.genre_ids.map((id) => GENRE_MAP[id] || 'Unknown').filter(Boolean),
        posterPath: movie.poster_path,
        overview: movie.overview,
        originCountry: movie.origin_country?.[0],
        originalLanguage: movie.original_language,
    }));

    return json({ results });
};
