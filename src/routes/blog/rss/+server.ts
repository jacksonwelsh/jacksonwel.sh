import type { RequestHandler } from '@sveltejs/kit';
import entries from '../entries';

// FUCK xml
const feed = {
	title: "Jackson Welsh's Blog",
	link: 'https://jacksonwel.sh/blog',
	description: "thoughts from jackson welsh's brain",
	language: 'en-us',
	category: 'Technology',
	generator: 'me :)',
	docs: 'https://www.rssboard.org/rss-specification',
	ttl: 60,
	item: entries.map((entry) => ({
		title: entry.title,
		link: `https://jacksonwel.sh/blog/${entry.date}/${entry.slug}`,
		description: entry.gist,
		pubDate: new Date(Date.parse(entry.date)).toString()
	}))
};

const toXml = (data: any, parent: string | null = null): string => {
	if (Array.isArray(data))
		return data.map((d) => `<${parent}>${toXml(d, parent)}</${parent}>`).join('\n');
	if (typeof data !== 'object') return data;

	return Object.entries(data)
		.map(([tagName, tagValue]) => {
			if (Array.isArray(tagValue)) return toXml(tagValue, tagName);
			return `<${tagName}>${toXml(tagValue, tagName)}</${tagName}>`;
		})
		.join('\n');
};

export const GET: RequestHandler = async () => {
	const xml = `<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    ${toXml(feed)}
  </channel>
</rss>`;

	return new Response(String(xml), { headers: { 'Content-Type': 'application/xml' } });
};
