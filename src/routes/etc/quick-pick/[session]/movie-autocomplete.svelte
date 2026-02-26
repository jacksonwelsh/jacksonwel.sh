<script lang="ts">
    import type { MovieMetadata } from '../workers';
    import { countryCodeToFlag } from '../workers';

    interface Props {
        onSelect: (movie: MovieMetadata) => void;
    }

    let { onSelect }: Props = $props();

    let query = $state('');
    let results = $state<MovieMetadata[]>([]);
    let loading = $state(false);
    let showDropdown = $state(false);
    let debounceTimer: ReturnType<typeof setTimeout>;

    const search = async (q: string) => {
        if (q.length < 2) {
            results = [];
            return;
        }

        loading = true;
        try {
            const response = await fetch(`/etc/quick-pick/api/tmdb?q=${encodeURIComponent(q)}`);
            const data = await response.json();
            results = data.results || [];
        } catch {
            results = [];
        } finally {
            loading = false;
        }
    };

    const handleInput = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => search(query), 300);
        showDropdown = true;
    };

    const selectMovie = async (movie: MovieMetadata) => {
        query = movie.title;
        showDropdown = false;
        results = [];

        // Fetch full movie details including tagline and director
        try {
            const response = await fetch(`/etc/quick-pick/api/tmdb/${movie.tmdbId}`);
            const data = await response.json();
            if (data.movie) {
                onSelect(data.movie);
                return;
            }
        } catch {
            // Fall back to basic movie data if details fetch fails
        }
        onSelect(movie);
    };

    const handleBlur = () => {
        // Delay hiding to allow click on dropdown items
        setTimeout(() => {
            showDropdown = false;
        }, 200);
    };
</script>

<div class="relative w-full">
    <label for="movie-search" class="block text-sm font-medium mb-1">Search for a movie</label>
    <input
        id="movie-search"
        type="text"
        bind:value={query}
        oninput={handleInput}
        onfocus={() => showDropdown = true}
        onblur={handleBlur}
        placeholder="Start typing a movie title..."
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        autocomplete="off"
    />

    {#if loading}
        <div class="absolute right-3 top-9">
            <div class="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    {/if}

    {#if showDropdown && results.length > 0}
        <ul class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {#each results as movie}
                <li>
                    <button
                        type="button"
                        onclick={() => selectMovie(movie)}
                        class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                        {#if movie.posterPath}
                            <img
                                src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                alt={movie.title}
                                class="w-8 h-12 object-cover rounded"
                            />
                        {:else}
                            <div class="w-8 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs">?</div>
                        {/if}
                        <div class="flex-1 min-w-0">
                            <div class="font-medium truncate">{movie.title}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                {#if movie.originCountry}
                                    {countryCodeToFlag(movie.originCountry)}&nbsp;
                                {/if}{movie.year || 'Unknown year'}
                                {#if movie.genres.length > 0}
                                    &middot; {movie.genres.slice(0, 2).join(', ')}
                                {/if}
                            </div>
                        </div>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}

    {#if showDropdown && query.length >= 2 && !loading && results.length === 0}
        <div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-gray-500">
            No movies found
        </div>
    {/if}
</div>
