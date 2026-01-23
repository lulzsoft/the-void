/**
 * Mission System Types
 * Big projects/opportunities for squads
 */

export interface Mission {
    id: string;
    title: string;
    description: string;
    requirements: string[]; // Required skills/experience
    duration: string; // "3 months", "6 weeks"
    compensation: string; // "Equity + $50K", "Revenue share"
    requiredSquadSize?: number; // Minimum squad size (optional)
    difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
    status: 'open' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: number;
    updatedAt: number;

    // Application tracking
    applications: MissionApplication[];
    assignedSquad?: string; // Squad ID if accepted

    // Metadata
    tags?: string[]; // "startup", "enterprise", "saas"
    remote?: boolean;
    deadline?: number; // Application deadline timestamp
}

export interface MissionApplication {
    squadId: string;
    squadName: string;
    appliedAt: number;
    status: 'pending' | 'accepted' | 'rejected';
    message?: string; // Optional cover message
}

export interface MissionStats {
    totalMissions: number;
    openMissions: number;
    inProgressMissions: number;
    totalApplications: number;
}

export type MissionStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';
