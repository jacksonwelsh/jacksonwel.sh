import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cardImage } from '../src/lib/cyclone/cardImage.ts';
import type { Photo } from '../src/lib/cyclone/types.ts';

const photo: Photo = {
	id: 'photo',
	sort_order: 0,
	cover: true,
	status: 'ready',
	thumbnail_url: 'https://media.example/thumbnail-800-v2.jpg',
	feed_url: 'https://media.example/feed-1600-v2.jpg'
};

test('uses normalized previews with accurate responsive widths', () => {
	assert.deepEqual(cardImage(photo, '/map.png'), {
		src: photo.thumbnail_url,
		srcset: `${photo.thumbnail_url} 800w, ${photo.feed_url} 1600w`
	});
});

test('preserves old uploads and missing-image fallbacks without inventing dimensions', () => {
	for (const candidate of [
		{ ...photo, thumbnail_url: '/old-thumbnail.jpg' },
		{ ...photo, feed_url: '/old-feed.jpg' },
		{ ...photo, feed_url: undefined }
	])
		assert.deepEqual(cardImage(candidate), { src: candidate.thumbnail_url, srcset: undefined });
	assert.deepEqual(cardImage({ ...photo, thumbnail_url: undefined }), {
		src: photo.feed_url,
		srcset: undefined
	});
	assert.deepEqual(cardImage(undefined, '/map.png'), { src: '/map.png', srcset: undefined });
	assert.deepEqual(cardImage(), { src: undefined, srcset: undefined });
});
