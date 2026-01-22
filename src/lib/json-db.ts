
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB Structure
const INITIAL_DB = {
    candidates: [],
    messages: [], // Chat messages
    flaggedMessages: [], // Failed moderation
    bannedIPs: [],
    analytics: {
        visits: 0,
        startTime: Date.now()
    }
};

export interface DB {
    candidates: Candidate[];
    messages: Message[];
    flaggedMessages: Message[];
    bannedIPs: string[];
    analytics: {
        visits: number;
        startTime: number;
    }
}

export interface Candidate {
    id: string;
    codename: string;
    skill: string;
    painTolerance: number;
    score: number;
    answers: any[]; // Full conversation history
    ip: string;
    status: 'ADMITTED' | 'REJECTED';
    timestamp: string;
}

export interface Message {
    id: string;
    text: string;
    author: string;
    timestamp: string;
    flagged: boolean;
    flaggedWords?: string[];
    ip: string;
    type?: 'text' | 'image' | 'file';
    fileData?: string; // Base64
}

function readDB(): DB {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
        return INITIAL_DB;
    }
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return INITIAL_DB;
    }
}

function writeDB(data: DB) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
    read: readDB,
    write: writeDB,

    // Helpers
    addCandidate: (candidate: Candidate) => {
        const data = readDB();
        data.candidates.push(candidate);
        writeDB(data);
    },

    addMessage: (message: Message) => {
        const data = readDB();
        // If flagged, go to separate list
        if (message.flagged) {
            data.flaggedMessages.push(message);
        } else {
            data.messages.push(message);
        }
        writeDB(data);
    },

    banIP: (ip: string) => {
        const data = readDB();
        if (!data.bannedIPs.includes(ip)) {
            data.bannedIPs.push(ip);
            writeDB(data);
        }
    },

    unbanIP: (ip: string) => {
        const data = readDB();
        data.bannedIPs = data.bannedIPs.filter(b => b !== ip);
        writeDB(data);
    },

    deleteFlaggedMessage: (id: string) => {
        const data = readDB();
        data.flaggedMessages = data.flaggedMessages.filter(m => m.id !== id);
        writeDB(data);
    },

    incrementVisits: () => {
        // Optimization: don't write on every single read-only request to avoid IO thrashing
        // But for low traffic dev text, it's fine.
        const data = readDB();
        data.analytics.visits += 1;
        writeDB(data);
    }
};
