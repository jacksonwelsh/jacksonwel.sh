import { AWS_AKIA, AWS_SECA, PASSAGE_API_KEY } from '$env/static/private';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import type { CreateUserPayload } from '@passageidentity/passage-node';
import Passage from '@passageidentity/passage-node';
import { error } from '@sveltejs/kit';
import { SESv2Client, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { getUser } from '$lib/user.js';

const client = new SESv2Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: AWS_AKIA,
		secretAccessKey: AWS_SECA
	}
});

export const actions = {
	default: async ({ request, cookies }) => {
		const requestingUser = await getUser(cookies);
		if (!requestingUser) error(401, 'Not authenticated');
		if (!requestingUser.user_metadata?.isjackson) error(403, 'Not authorized');
		// make a new user
		const passage = new Passage({
			appID: PUBLIC_PASSAGE_APP_ID,
			apiKey: PASSAGE_API_KEY
		});

		const formData = await request.formData();

		const userEmail = formData.get('email');
		const userName = formData.get('name')?.toString();

		const payload: Partial<CreateUserPayload> = {};

		if (typeof userEmail !== 'string') {
			error(400, 'Email is a required entry in formData and must be a string');
		}

		payload.email = userEmail;
		if (userName) {
			payload.user_metadata = {
				name: userName
			};
		}

		const response = await passage.user.create(payload).then(async () => {
			const sendEmailCommand: SendEmailCommandInput = {
				Content: {
					Simple: {
						Body: {
							Text: {
								Data: "Welcome! Your account has been created on jackson's travel log. You can go to https://jacksonwel.sh/travel/login to sign in and access private content. If you have any issues, you can reply to this email.\n\nJackson"
							}
						},
						Subject: {
							Data: "Account created on jackson's travel log"
						}
					}
				},
				FromEmailAddress: '"jackson welsh" <notif@jacksonwel.sh>',
				Destination: {
					ToAddresses: [userEmail]
				}
			};

			client.send(new SendEmailCommand(sendEmailCommand));
		});
		return response;
	}
};
