import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ridePagination } from '../src/lib/cyclone/pagination.ts';

test('navigates three pages forward and back with opaque cursors', () => {
	const url = (path: string) => new URL(path, 'https://example.com');
	const first = ridePagination(url('/ride'), 'a+/=');
	assert.equal(first.previousHref, undefined);
	const second = ridePagination(url(first.nextHref!), 'b+/=');
	assert.equal(second.previousHref, '/ride');
	const third = ridePagination(url(second.nextHref!));
	assert.equal(third.nextHref, undefined);
	assert.equal(third.previousHref, first.nextHref);
	assert.equal(new URL(third.previousHref!, url('/')).searchParams.get('cursor'), 'a+/=');
});

test('direct cursor links return to the first page', () => {
	assert.equal(
		ridePagination(new URL('https://example.com/ride?cursor=direct')).previousHref,
		'/ride'
	);
});
