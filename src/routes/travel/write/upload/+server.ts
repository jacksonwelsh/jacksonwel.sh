import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid4 } from 'uuid';
import { R2_ACCESS_KEY_ID, R2_SECRET_KEY, R2_ACCOUNT_ID } from '$env/static/private';

const S3 = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_KEY
	}
});

export const POST: RequestHandler = async ({ request }) => {
	const formData = Object.fromEntries(await request.formData());

	if (formData.image) {
		// first check if the file has a name
		const image = formData.image as File;
		if (!image.name || image.name === 'undefined') {
			error(400, 'image name not found');
		}
		const imageToken = uuid4();
		const postId = formData.postId;
		const extension = image.name.split('.').at(-1) ?? 'undf';
		const objectKey = `${postId}/${imageToken}.${extension}`;

		const bufferedFile = await new Response(image).arrayBuffer();

		const putCommand = new PutObjectCommand({
			Bucket: 'travel-images',
			Key: objectKey,
			Body: bufferedFile as Buffer,
			ContentType: image.type
		});

		try {
			await S3.send(putCommand);
		} catch (e) {
			return json({
				success: 1,
				file: {
					url: 'http://localhost:5173/favicon.png',
					Key: 'bruh/moment.png'
				}
			});
		}

		const getCommand = new GetObjectCommand({
			Bucket: 'travel-images',
			Key: objectKey
		});

		const signedUrl = await getSignedUrl(S3, getCommand, {
			expiresIn: 64000
		});

		return json({
			success: 1,
			file: {
				url: signedUrl,
				key: objectKey
			}
		});
	} else if (formData.imageUrl) {
		// fetch the image from the remote location and upload to R2
		error(400, 'image url upload is not yet supported');
	}

	error(400, 'image must be present in `image` parameter of form data');
};
