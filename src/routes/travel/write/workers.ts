import {
	R2_ACCOUNT_ID,
	WORKERS_KV_ID,
	WORKERS_API_KEY,
	R2_ACCESS_KEY_ID,
	R2_SECRET_KEY,
	WORKERS_KV_CONFIG_ID
} from '$env/static/private';
import type { Block, GBlock, ParagraphData, PostListing } from '$lib/types';
import { S3Client, type GetObjectCommandInput, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error, redirect } from '@sveltejs/kit';

const API_ROOT = `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT_ID}/storage/kv/namespaces/${WORKERS_KV_ID}`;
const CONFIG_API_ROOT = `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT_ID}/storage/kv/namespaces/${WORKERS_KV_CONFIG_ID}`;

const headers = {
	Authorization: `Bearer ${WORKERS_API_KEY}`,
	'Content-Type': 'application/json'
};

export const getPost = async (slug: string) => {
	const response = await fetch(`${API_ROOT}/values/${slug}`, {
		method: 'GET',
		headers
	}).then((r) => r.json());

	console.log({ response: JSON.stringify(response), slug });

	return { ...response, slug };
};

export const getAllPosts = async () => {
	console.log({ headers });

	const keys = await fetch(`${API_ROOT}/keys`, {
		method: 'GET',
		headers
	})
		.then((r) => r.json())
		.then(({ result }: { result: { name: string }[] }) => result.map(({ name }) => name));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const responseQueue: Promise<Record<string, Record<string, any>>>[] = [];
	for (const key of keys) {
		responseQueue.push(getPost(key));
	}

	const response = await Promise.all(responseQueue);

	return response.sort((a, b) => {
		return b.content.time - a.content.time;
	});
};

export const getPostListing = async (): Promise<Array<PostListing>> => {
	const listing = await fetch(`${API_ROOT}/values/meta.index`, {
		method: 'GET',
		headers
	}).then((r) => r.json());

	return listing;
};

export const validateInviteCode = async (code: string): Promise<boolean> => {
	const remoteCode = await fetch(`${CONFIG_API_ROOT}/values/invite`, {
		headers,
		method: 'GET'
	}).then((r) => r.text());
	console.log({ remoteCode });

	return code === remoteCode;
};

const makeExcerpt = (content: EditorJS.OutputData): string => {
	const paragraphs = content?.blocks.filter((block) => block.type === 'paragraph');
	if (paragraphs.length === 0) return '';
	const firstParagraph = paragraphs[0];
	const text = firstParagraph.data.text;
	if (text.length > 200) return text.slice(0, 200) + '...';
	return text;
};

export const putPost = async (
	title: string,
	slug: string,
	postId: string,
	content: EditorJS.OutputData
) => {
	const command = {
		title,
		slug: slug.toLowerCase(),
		content,
		postId
	};

	// extend the post listing
	const listing = await getPostListing();
	listing.push({
		slug: command.slug,
		title: command.title,
		time: content.time ?? Date.now(),
		excerpt: makeExcerpt(content)
	});

	await fetch(`${API_ROOT}/values/meta.index`, {
		headers,
		method: 'PUT',
		body: JSON.stringify(listing)
	});

	return await fetch(`${API_ROOT}/values/${command.slug}`, {
		headers,
		method: 'PUT',
		body: JSON.stringify({
			...command
		})
	}).then((r) => {
		if (r.ok) {
			throw redirect(301, `/travel/${slug}`);
		} else {
			throw error(500);
		}
	});
};

const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_KEY
	}
});

export const signImageUrl = async (key: string): Promise<string> => {
	const command: GetObjectCommandInput = {
		Key: key,
		Bucket: 'travel-images'
	};

	return await getSignedUrl(S3, new GetObjectCommand(command), {
		expiresIn: 3600
	});
};
