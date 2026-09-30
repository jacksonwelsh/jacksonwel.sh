// Carry the cursor trail in links so previous pages work after reloads and without JS.
export function ridePagination(url: URL, nextCursor?: string) {
	const cursor = url.searchParams.get('cursor');
	const previous = cursor ? url.searchParams.getAll('previous') : [];
	const href = (pageCursor: string, trail: string[]) => {
		const query = new URLSearchParams();
		if (pageCursor) query.set('cursor', pageCursor);
		for (const entry of trail) query.append('previous', entry);
		return `/ride${query.size ? `?${query}` : ''}`;
	};
	return {
		previousHref: cursor ? href(previous.at(-1) ?? '', previous.slice(0, -1)) : undefined,
		nextHref: nextCursor ? href(nextCursor, [...previous, cursor ?? '']) : undefined
	};
}
