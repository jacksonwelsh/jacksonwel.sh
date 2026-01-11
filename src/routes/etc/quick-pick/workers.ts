import db from './db';

// Run migrations on startup (ignore errors if columns already exist)
try { db.exec(`ALTER TABLE sessions ADD COLUMN mode TEXT DEFAULT 'default'`); } catch {}
try { db.exec(`ALTER TABLE nominations ADD COLUMN metadata TEXT`); } catch {}

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
};

export type NominationMetadata = MovieMetadata | null;

type SessionDbRecord = {
    id: string;
    hostKey: string;
    closedAt?: number;
    maxNominations: number;
    mode: SessionMode;
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
    mode: SessionMode;
}

const getRawSession = async (sessionId: string): Promise<Session> => {
    const result = db.prepare(`
        SELECT
            s.id,
            s.host_key,
            s.closed_at,
            s.max_nominations,
            s.winner,
            s.mode,
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
        mode: SessionMode;
        participants: string;
        nominations: string;
    };

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
        mode: result.mode ?? 'default',
        participants: JSON.parse(result.participants),
        nominations,
    }
}

const sanitizeSession = (session: Session, hostKey?: string): Session => ({
    ...session,
    hostKey: undefined,
    isHost: hostKey === session.hostKey
});

export const getSession = async (sessionId: string, hostKey?: string) => {
    const session = await getRawSession(sessionId);

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

export const makeSession = async (mode: SessionMode = 'default') => {
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
    };

    await putSession(session);
    const hostId = (await joinSession(session.id)).participantId;

    return { session, hostId };
}

const putSession = async (session: SessionDbRecord) => {
    db.prepare('INSERT INTO sessions (id, host_key, mode) VALUES (?, ?, ?)').run(session.id, session.hostKey, session.mode);
}

export const joinSession = async (sessionId: string) => {
    const participantId = crypto.randomUUID();
    console.log(`Participant ID: ${participantId}`);

    const session = await getRawSession(sessionId);

    db.prepare('INSERT INTO participants (id, session) VALUES (?, ?)').run(participantId, session.id);
    return { session: sanitizeSession(session), participantId };
}

export const nominate = async (sessionId: string, participantId: string, nomination: string, metadata?: NominationMetadata) => {
    console.log(`${participantId} has nominated ${nomination} in ${sessionId}`);
    db.prepare('INSERT INTO nominations (id, session, owner, value, metadata) VALUES (?, ?, ?, ?, ?)')
        .run(crypto.randomUUID(), sessionId, participantId, nomination, metadata ? JSON.stringify(metadata) : null);
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
}

export const finalize = async (sessionId: string, hostKey: string) => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND host_key = ?')
        .get(sessionId, hostKey);

    if (!session) {
        console.error("Invalid hostKey");
        return { success: false };
    }

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

    const winner = rankedChoice(votes);

    db.prepare("UPDATE sessions SET winner = ? WHERE id = ? AND host_key = ?")
        .run(winner, sessionId, hostKey);

    return { winner };
}

const rankedChoice = (votes: {
    participant: string,
    votes: { id: string; value: string; rank: number; }[]
}[]) => {
    // Get all nomination IDs
    const allNominations = new Set<string>();
    votes.forEach(v => v.votes.forEach(vote => allNominations.add(vote.id)));

    let remainingNominations = new Set(allNominations);

    while (remainingNominations.size > 1) {
        // Count first-choice votes for remaining nominations
        const voteCounts = new Map<string, number>();
        remainingNominations.forEach(nom => voteCounts.set(nom, 0));

        for (const voter of votes) {
            // Get voter's highest-ranked remaining nomination
            const validVotes = voter.votes
                .filter(v => remainingNominations.has(v.id))
                .sort((a, b) => b.rank - a.rank); // highest rank first

            if (validVotes.length > 0) {
                const topChoice = validVotes[0].id;
                voteCounts.set(topChoice, voteCounts.get(topChoice)! + 1);
            }
        }

        // Check if anyone has majority
        const totalVotes = votes.length;
        const majority = totalVotes / 2;

        for (const [nomination, count] of voteCounts) {
            if (count > majority) {
                return nomination; // Winner found
            }
        }

        // Eliminate nomination with fewest votes
        let minVotes = Infinity;
        let toEliminate = '';

        for (const [nomination, count] of voteCounts) {
            if (count < minVotes) {
                minVotes = count;
                toEliminate = nomination;
            }
        }

        console.log(`Eliminating ${toEliminate}`);
        remainingNominations.delete(toEliminate);
    }

    // Return last remaining nomination
    return remainingNominations.values().next().value;
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
