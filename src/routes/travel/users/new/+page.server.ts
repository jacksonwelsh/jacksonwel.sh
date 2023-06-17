import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, PASSAGE_API_KEY } from '$env/static/private';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import type { CreateUserPayload } from '@passageidentity/passage-node';
import Passage from '@passageidentity/passage-node';
import { error } from '@sveltejs/kit';
import { SESv2Client, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-sesv2';

const client = new SESv2Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY
	}
});

export const actions = {
	default: async ({ request }) => {
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
			throw error(400, 'Email is a required entry in formData and must be a string');
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
