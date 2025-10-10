import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { makeSession } from './workers';

export const actions = {
    default: async ({ cookies }) => {
        // Create a new session
        const { session, hostId } = await makeSession();
        console.log({ session, hostId });

        cookies.set('quick-pick.hostKey',
            session.hostKey!,
            { path: `/misc/quick-pick/${session.id}`, httpOnly: false }
        );

        cookies.set('quick-pick.participantId',
            hostId,
            { path: `/misc/quick-pick/${session.id}`, httpOnly: false }
        );

        return redirect(301, `/misc/quick-pick/${session.id}`);
    },
} satisfies Actions;
