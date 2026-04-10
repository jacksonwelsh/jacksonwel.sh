import db from './db';

// Run migrations on startup (ignore errors if columns already exist)
try { db.exec(`ALTER TABLE sessions ADD COLUMN mode TEXT DEFAULT 'default'`); } catch {}
try { db.exec(`ALTER TABLE nominations ADD COLUMN metadata TEXT`); } catch {}
try { db.exec(`ALTER TABLE sessions ADD COLUMN rankings TEXT`); } catch {}
try { db.exec(`ALTER TABLE sessions ADD COLUMN expected_participants INTEGER`); } catch {}

export type SessionMode = 'default' | 'movie';

export type MovieMetadata = {
    tmdbId: number;
    title: string;
    year: number;
    genres: string[];
    posterPath?: string | null;
    overview?: string;
    tagline?: string;
    director?: string;
    originCountry?: string;
    originalLanguage?: string;
    runtime?: number;
};

export type NominationMetadata = MovieMetadata | null;

type SessionDbRecord = {
    id: string;
    hostKey: string;
    closedAt?: number;
    maxNominations: number;
    mode: SessionMode;
    expectedParticipants?: number;
}

export type Nomination = {
    id: string;
    value: string;
    metadata?: NominationMetadata;
};

export type Session = {
    id: string;
    hostKey?: string; // Only present in remote instances
    participants: string[];
    isHost?: boolean; // Only present in local instances
    nominations: Nomination[];
    closedAt?: number;
    maxNominations: number;
    winner: string | null;
    rankings: { id: string; points: number }[] | null; // Ordered list from 1st to last place
    mode: SessionMode;
    expectedParticipants?: number;
}

const getRawSession = async (sessionId: string): Promise<Session | null> => {
    const result = db.prepare(`
        SELECT
            s.id,
            s.host_key,
            s.closed_at,
            s.max_nominations,
            s.winner,
            s.rankings,
            s.mode,
            s.expected_participants,
            (SELECT json_group_array(p.id)
             FROM participants p
             WHERE p.session = s.id) as participants,
            (SELECT json_group_array(json_object('id', n.id, 'value', n.value, 'metadata', n.metadata))
             FROM nominations n
             WHERE n.session = s.id) as nominations
        FROM sessions s
        WHERE s.id = ?
        GROUP BY s.id;
    `).get(sessionId) as {
        id: string;
        host_key: string;
        closed_at: number;
        max_nominations: number;
        winner: string | null;
        rankings: string | null;
        mode: SessionMode;
        expected_participants: number | null;
        participants: string;
        nominations: string;
    } | undefined;

    if (!result) {
        return null;
    }

    const nominations = JSON.parse(result.nominations).map((n: { id: string; value: string; metadata: string | null }) => ({
        ...n,
        metadata: n.metadata ? JSON.parse(n.metadata) : null
    }));

    return {
        id: result.id,
        hostKey: result.host_key,
        closedAt: result.closed_at,
        maxNominations: result.max_nominations,
        winner: result.winner,
        rankings: result.rankings ? JSON.parse(result.rankings) : null,
        mode: result.mode ?? 'default',
        expectedParticipants: result.expected_participants ?? undefined,
        participants: JSON.parse(result.participants),
        nominations,
    }
}

const sanitizeSession = (session: Session, hostKey?: string): Session => ({
    ...session,
    hostKey: undefined,
    isHost: hostKey === session.hostKey
});

export const getSession = async (sessionId: string, hostKey?: string): Promise<Session | null> => {
    const session = await getRawSession(sessionId);
    if (!session) {
        return null;
    }

    return sanitizeSession(session, hostKey);
};

export const getMyNominations = (sessionId: string, participantId: string): string[] => {
    const result = db.prepare('SELECT value FROM nominations WHERE session = ? AND owner = ?')
        .all(sessionId, participantId) as { value: string }[];
    return result.map(n => n.value);
}

export const getMyVotes = (sessionId: string, participantId: string) => {
    const result = db.prepare('SELECT nomination, rank FROM votes WHERE session = ? AND participant = ?')
        .all(sessionId, participantId) as {
            nomination: string;
            rank: number;
        }[];
    return result;
}

export const getVotedUsers = (sessionId: string): string[] => {
    const result = db.prepare('SELECT DISTINCT participant FROM votes WHERE session = ?')
        .all(sessionId) as { participant: string }[];

    return result.map(v => v.participant);
}

export const getNominatorCount = (sessionId: string): number => {
    const result = db.prepare('SELECT COUNT(DISTINCT owner) as count FROM nominations WHERE session = ?')
        .get(sessionId) as { count: number };
    return result.count;
}

export const makeSession = async (mode: SessionMode = 'default', expectedParticipants?: number) => {
    const sessionId = makeSessionId(4);
    console.log(`Session ID: ${sessionId}`);

    // hostId is used for participation while hostKey is used for management.
    // hostId should be considered public knowledge while hostKey is secret.
    const hostKey = crypto.randomUUID();

    const session: SessionDbRecord = {
        id: sessionId,
        hostKey,
        maxNominations: 1,
        mode,
        expectedParticipants,
    };

    await putSession(session);
    const joinResult = await joinSession(session.id);
    // Session was just created, so joinSession should never return null
    const hostId = joinResult!.participantId;

    return { session, hostId };
}

const putSession = async (session: SessionDbRecord) => {
    db.prepare('INSERT INTO sessions (id, host_key, mode, expected_participants) VALUES (?, ?, ?, ?)')
        .run(session.id, session.hostKey, session.mode, session.expectedParticipants ?? null);
}

export const joinSession = async (sessionId: string) => {
    const session = await getRawSession(sessionId);
    if (!session) {
        return null;
    }

    const participantId = crypto.randomUUID();
    console.log(`Participant ID: ${participantId}`);

    db.prepare('INSERT INTO participants (id, session) VALUES (?, ?)').run(participantId, session.id);
    return { session: sanitizeSession(session), participantId };
}

export const nominate = async (sessionId: string, participantId: string, nomination: string, metadata?: NominationMetadata) => {
    console.log(`${participantId} has nominated ${nomination} in ${sessionId}`);
    db.prepare('INSERT INTO nominations (id, session, owner, value, metadata) VALUES (?, ?, ?, ?, ?)')
        .run(crypto.randomUUID(), sessionId, participantId, nomination, metadata ? JSON.stringify(metadata) : null);

    // Auto-close: if expectedParticipants is set and enough distinct users have submitted, close the session
    const sessionData = db.prepare('SELECT expected_participants, closed_at FROM sessions WHERE id = ?')
        .get(sessionId) as { expected_participants: number | null; closed_at: number | null } | undefined;

    if (sessionData?.expected_participants && !sessionData.closed_at) {
        const { count } = db.prepare('SELECT COUNT(DISTINCT owner) as count FROM nominations WHERE session = ?')
            .get(sessionId) as { count: number };

        if (count >= sessionData.expected_participants) {
            const now = Math.floor(Date.now() / 1000);
            db.prepare('UPDATE sessions SET closed_at = ? WHERE id = ? AND closed_at IS NULL')
                .run(now, sessionId);
            console.log(`Session ${sessionId} auto-closed after ${count} participants submitted nominations`);
        }
    }
}

export const closeSession = async (sessionId: string, hostKey: string) => {
    const now = Math.floor(Date.now() / 1000);
    db.prepare('UPDATE sessions SET closed_at = ? WHERE id = ? AND host_key = ?')
        .run(now, sessionId, hostKey);
}

export const openSession = async (sessionId: string, hostKey: string) => {
    db.prepare('UPDATE sessions SET closed_at = NULL WHERE id = ? AND host_key = ?')
        .run(sessionId, hostKey);
}

export const vote = async (sessionId: string, participantId: string, votes: string[]) => {
    for (let i = 0; i < votes.length; ++i) {
        db.prepare('INSERT INTO votes (session, participant, nomination, rank) values (?, ?, ?, ?)')
            .run(sessionId, participantId, votes[i], votes.length - i);
    }

    // Auto-finalize: if all participants who submitted nominations have also voted, finalize
    const sessionData = db.prepare('SELECT winner FROM sessions WHERE id = ?')
        .get(sessionId) as { winner: string | null } | undefined;

    if (sessionData && !sessionData.winner) {
        const { nominatorCount } = db.prepare('SELECT COUNT(DISTINCT owner) as nominatorCount FROM nominations WHERE session = ?')
            .get(sessionId) as { nominatorCount: number };

        const { voterCount } = db.prepare('SELECT COUNT(DISTINCT participant) as voterCount FROM votes WHERE session = ?')
            .get(sessionId) as { voterCount: number };

        if (nominatorCount > 0 && voterCount >= nominatorCount) {
            finalizeInternal(sessionId);
            console.log(`Session ${sessionId} auto-finalized after all ${voterCount} nominators voted`);
        }
    }
}

const finalizeInternal = (sessionId: string) => {
    const rawVotes = db.prepare(`
        SELECT
            p.id,
            (SELECT
                json_group_array(json_object(
                    'id', v.nomination,
                    'value', n.value,
                    'rank', v.rank
                )
            )
            FROM votes v
            LEFT JOIN nominations n ON n.id = v.nomination
            WHERE v.participant = p.id) as participantVotes
            FROM participants p
            WHERE p.session = ?
    `).all(sessionId) as {
        id: string;
        participantVotes: string;
    }[];

    const votes = rawVotes.map(v => ({ participant: v.id, votes: JSON.parse(v.participantVotes) })) as {
        participant: string,
        votes: {
            id: string;
            value: string;
            rank: number;
        }[]
    }[];

    const rankings = bordaCount(votes);
    const winner = rankings[0]?.id ?? null;

    db.prepare("UPDATE sessions SET winner = ?, rankings = ? WHERE id = ?")
        .run(winner, JSON.stringify(rankings), sessionId);

    return { winner, rankings };
}

export const finalize = async (sessionId: string, hostKey: string) => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND host_key = ?')
        .get(sessionId, hostKey);

    if (!session) {
        console.error("Invalid hostKey");
        return { success: false };
    }

    return finalizeInternal(sessionId);
}

const bordaCount = (votes: {
    participant: string,
    votes: { id: string; value: string; rank: number; }[]
}[]): { id: string; points: number }[] => {
    // Sum up Borda points for each nomination
    // Higher rank = more points (already stored this way from vote() function)
    const pointTotals = new Map<string, number>();

    for (const voter of votes) {
        for (const vote of voter.votes) {
            const currentPoints = pointTotals.get(vote.id) ?? 0;
            pointTotals.set(vote.id, currentPoints + vote.rank);
        }
    }

    // Sort by total points (descending) to get rankings
    return Array.from(pointTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id, points]) => ({ id, points }));
}

const makeSessionId = (len: number) => {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let sessionId = "";

    for (let i = 0; i < len; ++i) {
        const newChar = alpha.charAt(Math.floor(Math.random() * alpha.length));
        sessionId += newChar;
    }

    return sessionId;
}
