export type Rank = 'INITIATE' | 'OPERATIVE' | 'ELITE' | 'PHANTOM' | 'OMNISCIENT';

export interface UserProgress {
    xp: number;
    rank: Rank;
    nextRankXp: number;
    progress: number;
}

const RANKS: { name: Rank; minXp: number }[] = [
    { name: 'INITIATE', minXp: 0 },
    { name: 'OPERATIVE', minXp: 100 },
    { name: 'ELITE', minXp: 1000 },
    { name: 'PHANTOM', minXp: 5000 },
    { name: 'OMNISCIENT', minXp: 20000 },
];

export function calculateRank(xp: number): UserProgress {
    let currentRank = RANKS[0];
    let nextRank = RANKS[1];

    for (let i = 0; i < RANKS.length; i++) {
        if (xp >= RANKS[i].minXp) {
            currentRank = RANKS[i];
            nextRank = RANKS[i + 1] || null;
        } else {
            break;
        }
    }

    if (!nextRank) {
        return {
            xp,
            rank: currentRank.name,
            nextRankXp: xp,
            progress: 100
        };
    }

    const rankRange = nextRank.minXp - currentRank.minXp;
    const userProgressInRank = xp - currentRank.minXp;
    const progressPercentage = Math.min(100, Math.max(0, (userProgressInRank / rankRange) * 100));

    return {
        xp,
        rank: currentRank.name,
        nextRankXp: nextRank.minXp,
        progress: Number(progressPercentage.toFixed(1))
    };
}

export const XP_REWARDS = {
    REGISTER: 100,
    JOIN_SQUAD: 50,
    CREATE_SQUAD: 500,
    COMPLETE_MISSION: 1000,
    LOGIN_DAILY: 10
};
