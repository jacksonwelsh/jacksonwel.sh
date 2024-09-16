import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import { Passage } from '@passageidentity/passage-js';

export const load = async () => {
	const passage = new Passage(PUBLIC_PASSAGE_APP_ID);
	const appInfo = await passage.app.info();

	return { appInfo };
};
