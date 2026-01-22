import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Site configuration store
interface SiteStyles {
    fontSize: {
        heading: number; // rem multiplier
        body: number;
    };
    lineHeight: number;
    darkness: number; // 0-100
    accentOpacity: number; // 0-1
}

interface SiteConfigState {
    styles: SiteStyles;
    setStyles: (styles: Partial<SiteStyles>) => void;
    resetStyles: () => void;
}

const defaultStyles: SiteStyles = {
    fontSize: {
        heading: 1,
        body: 1,
    },
    lineHeight: 1.5,
    darkness: 100,
    accentOpacity: 0.8,
};

export const useSiteConfig = create<SiteConfigState>((set) => ({
    styles: defaultStyles,
    setStyles: (newStyles) =>
        set((state) => ({
            styles: { ...state.styles, ...newStyles },
        })),
    resetStyles: () => set({ styles: defaultStyles }),
}));

// Audio state store
interface AudioState {
    isPlaying: boolean;
    volume: number;
    setIsPlaying: (playing: boolean) => void;
    setVolume: (volume: number) => void;
}

export const useAudioState = create<AudioState>((set) => ({
    isPlaying: false,
    volume: 0.08,
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setVolume: (volume) => set({ volume }),
}));

// Initiation state store
interface InitiationState {
    phase: 'intro' | 'questioning' | 'verdict' | 'complete';
    messages: Array<{ role: 'user' | 'gatekeeper'; content: string }>;
    verdict: 'ADMITTED' | 'PENDING' | 'REJECTED' | null;
    score: number | null;
    setPhase: (phase: InitiationState['phase']) => void;
    addMessage: (message: { role: 'user' | 'gatekeeper'; content: string }) => void;
    setVerdict: (verdict: InitiationState['verdict'], score: number) => void;
    reset: () => void;
}

export const useInitiationState = create<InitiationState>()(
    persist(
        (set) => ({
            phase: 'intro',
            messages: [],
            verdict: null,
            score: null,
            setPhase: (phase) => set({ phase }),
            addMessage: (message) =>
                set((state) => ({ messages: [...state.messages, message] })),
            setVerdict: (verdict, score) => set({ verdict, score, phase: 'verdict' }),
            reset: () =>
                set({
                    phase: 'intro',
                    messages: [],
                    verdict: null,
                    score: null,
                }),
        }),
        {
            name: 'initiation-storage',
        }
    )
);

// Admin session store
interface AdminSession {
    isAuthenticated: boolean;
    setAuthenticated: (auth: boolean) => void;
    authenticate: () => void;
    logout: () => void;
}

export const useAdminSession = create<AdminSession>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            authenticate: () => set({ isAuthenticated: true }),
            logout: () => set({ isAuthenticated: false }),
        }),
        {
            name: 'admin-session',
        }
    )
);

// Candidate store (New)
export interface Candidate {
    id: string;
    codename: string;
    skill: string;
    painTolerance: number;
    score: number;
    submittedAt: string;
}

interface CandidateState {
    candidates: Candidate[];
    addCandidate: (candidate: Omit<Candidate, 'id' | 'submittedAt'>) => void;
}

export const useCandidateStore = create<CandidateState>()(
    persist(
        (set) => ({
            candidates: [],
            addCandidate: (candidate) =>
                set((state) => ({
                    candidates: [
                        {
                            ...candidate,
                            id: Math.random().toString(36).substring(7),
                            submittedAt: new Date().toISOString(),
                        },
                        ...state.candidates,
                    ],
                })),
        }),
        {
            name: 'void-candidates',
        }
    )
);
