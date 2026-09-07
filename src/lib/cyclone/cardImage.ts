import type { Photo } from './types';

export const cardImage = (photo?: Photo, mapURL?: string) => {
	const src = photo?.thumbnail_url ?? photo?.feed_url ?? mapURL;
	// Only normalized variants have guaranteed pixel widths.
	const srcset =
		photo?.thumbnail_url?.endsWith('/thumbnail-800-v2.jpg') &&
		photo.feed_url?.endsWith('/feed-1600-v2.jpg')
			? `${photo.thumbnail_url} 800w, ${photo.feed_url} 1600w`
			: undefined;
	return { src, srcset };
};
