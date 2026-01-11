import { getSession, joinSession, closeSession, openSession, getMyNominations, getMyVotes, finalize, getVotedUsers, nominate, vote, type MovieMetadata } from "../workers";
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
    const sessionId = params.session;
    const hostKey = cookies.get('quick-pick.hostKey');

    let participantId = cookies.get('quick-pick.participantId');
    if (!participantId) {
        const { session, participantId } = await joinSession(sessionId);
        cookies.set('quick-pick.participantId', participantId, { path: `/etc/quick-pick/${sessionId}` });
        return { session, participantId };
    }

    const session = await getSession(sessionId, hostKey);
    const myNominations = getMyNominations(sessionId, participantId);
    const myVotes = getMyVotes(sessionId, participantId);
    const votedUsers = getVotedUsers(sessionId);

    return { session, participantId, myNominations, myVotes, votedUsers }
}


export const actions = {
    nominate: async ({ cookies, request, params }) => {
        const data = await request.formData();
        const nomination = data.get('nomination');
        if (!nomination) {
            return fail(400, { nomination, missing: true });
        }
        const participantId = cookies.get('quick-pick.participantId');
        if (!participantId) {
            return fail(400, { participantId, missing: true });
        }
        const sessionId = params.session;

        const metadataStr = data.get('metadata');
        let metadata: MovieMetadata | undefined;
        if (metadataStr && typeof metadataStr === 'string' && metadataStr.length > 0) {
            try {
                metadata = JSON.parse(metadataStr);
            } catch {
                // Ignore invalid JSON
            }
        }

        // Use proper casing from TMDB for movie mode, lowercase for default mode
        const nominationValue = metadata?.title ?? nomination.toString().toLowerCase();

        nominate(sessionId, participantId, nominationValue, metadata);

        return { success: true };
    },
    close: async ({ cookies, request, params }) => {
        const hostKey = cookies.get('quick-pick.hostKey');
        if (!hostKey) {
            return fail(400, { hostKey, missing: true });
        }

        const sessionId = params.session;

        closeSession(sessionId, hostKey);

        return { success: true };
    },
    open: async ({ cookies, params }) => {
        const hostKey = cookies.get('quick-pick.hostKey');
        if (!hostKey) {
            return fail(400, { hostKey, missing: true });
        }

        const sessionId = params.session;

        openSession(sessionId, hostKey);

        return { success: true };
    },
    vote: async ({ cookies, request, params }) => {
        const participantId = cookies.get('quick-pick.participantId');
        if (!participantId) {
            return fail(400, { participantId, missing: true });
        }

        const data = await request.formData();
        const votes = data.get('votes');
        if (!votes) {
            return fail(400, { votes, missing: true });
        }

        const sessionId = params.session;
        vote(sessionId, participantId, votes.toString().split(' '));

        return { success: true };
    },
    finalize: async ({ cookies, params }) => {
        const hostKey = cookies.get('quick-pick.hostKey');
        if (!hostKey) {
            return fail(400, { hostKey, missing: true });
        }

        const sessionId = params.session;

        finalize(sessionId, hostKey);

        return { success: true };
    }
} satisfies Actions;

