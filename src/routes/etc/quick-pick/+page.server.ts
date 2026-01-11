import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { makeSession, type SessionMode } from './workers';

export const actions = {
    create: async ({ cookies, request }) => {
        const data = await request.formData();
        const mode = (data.get('mode') as SessionMode) || 'default';

        const { session, hostId } = await makeSession(mode);
        console.log({ session, hostId });

        cookies.set('quick-pick.hostKey',
            session.hostKey!,
            { path: `/etc/quick-pick/${session.id}`, httpOnly: false }
        );

        cookies.set('quick-pick.participantId',
            hostId,
            { path: `/etc/quick-pick/${session.id}`, httpOnly: false }
        );

        return redirect(301, `/etc/quick-pick/${session.id}`);
    },
    join: async ({ request }) => {
        // Join an existing session
        const data = await request.formData();
        return redirect(301, `/etc/quick-pick/${data.get('sid')}`);
    }
} satisfies Actions;
