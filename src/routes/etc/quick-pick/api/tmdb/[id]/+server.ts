import { TMDB_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { MovieMetadata } from '../../../workers';

type TMDBMovieDetails = {
    id: number;
    title: string;
    release_date: string;
    genres: { id: number; name: string }[];
    poster_path: string | null;
    overview: string;
    tagline: string;
};

type TMDBCredits = {
    crew: { id: number; name: string; job: string }[];
};

export const GET: RequestHandler = async ({ params }) => {
    const movieId = params.id;

    if (!TMDB_API_KEY) {
        return json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    // Fetch movie details and credits in parallel
    const [detailsResponse, creditsResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
    ]);

    if (!detailsResponse.ok) {
        return json({ error: 'TMDB API error' }, { status: detailsResponse.status });
    }

    const details: TMDBMovieDetails = await detailsResponse.json();
    const credits: TMDBCredits = creditsResponse.ok ? await creditsResponse.json() : { crew: [] };

    const director = credits.crew.find((c) => c.job === 'Director')?.name;

    const movie: MovieMetadata = {
        tmdbId: details.id,
        title: details.title,
        year: details.release_date ? parseInt(details.release_date.split('-')[0], 10) : 0,
        genres: details.genres.map((g) => g.name),
        posterPath: details.poster_path,
        overview: details.overview,
        tagline: details.tagline || undefined,
        director: director,
    };

    return json({ movie });
};
