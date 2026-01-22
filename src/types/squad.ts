/**
 * Squad System Types
 * Legion/Collective formation and management
 */

export interface Squad {
    id: string; // unique squad ID
    name: string; // "Design Collective", "Dev Warriors"
    description: string; // short description
    leader: string; // username of creator/leader
    members: string[]; // array of usernames
    maxMembers: number; // 3-8 typically
    skills: string[]; // required/desired skills
    status: 'recruiting' | 'full' | 'active' | 'disbanded';
    createdAt: number; // timestamp
    updatedAt: number; // timestamp

    // Optional fields
    avatar?: string; // squad logo/avatar URL
    missions?: string[]; // active mission IDs
    tags?: string[]; // categorization
}

export interface SquadMember {
    username: string;
    joinedAt: number;
    role: 'leader' | 'member';
}

export interface SquadStats {
    totalSquads: number;
    activeSquads: number;
    totalMembers: number; // across all squads
    averageSquadSize: number;
}

export type SquadStatus = 'recruiting' | 'full' | 'active' | 'disbanded';
