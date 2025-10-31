import { error, type RequestHandler } from "@sveltejs/kit";
import { getSession, getVotedUsers, type Session } from "../../workers";

export const GET: RequestHandler = ({ params, cookies }) => {
    const sessionId = params.session;
    if (!sessionId) {
        return error(400, 'missing session id... how?');
    }

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Send initial data
            const send = (data: { session: Session, votedUsers: string[] }) => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                    );
                    if (data.session.winner) {
                        clearInterval(interval);
                        controller.close();
                    }
                } catch (e) {
                    console.error(e);
                    clearInterval(interval);
                }
            };

            // Poll KV and send updates
            const interval = setInterval(async () => {
                const session = await getSession(sessionId, cookies.get('quick-pick.hostKey'));
                let votedUsers: string[] = [];
                if (session.isHost) {
                    votedUsers = getVotedUsers(sessionId);
                }
                send({ session, votedUsers });
            }, 500);

            // Cleanup on disconnect
            return () => clearInterval(interval);
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}
