import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
// These will be replaced with actual environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Member {
    id: string;
    encrypted_data: string;
    tier: 'aday' | 'inisye' | 'ustat';
    created_at: string;
    updated_at: string;
}

export interface Manifesto {
    id: string;
    content: object;
    timeline: object;
    is_active: boolean;
}

export interface SiteConfig {
    id: string;
    styles: {
        fontSize: {
            heading: number;
            body: number;
        };
        lineHeight: number;
        darkness: number;
        accentOpacity: number;
    };
    updated_at: string;
}

export interface BannedIP {
    ip: string;
    reason: string;
    banned_at: string;
}

export interface PotentialMember {
    id: string;
    conversation: Array<{ role: string; content: string }>;
    score: number;
    ip: string;
    created_at: string;
}

// Helper functions
export async function checkIPBanned(ip: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('banned_ips')
        .select('ip')
        .eq('ip', ip)
        .single();

    return !!data && !error;
}

export async function banIP(ip: string, reason: string): Promise<void> {
    await supabase.from('banned_ips').insert({ ip, reason });
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
    const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('id', 'main')
        .single();

    if (error) return null;
    return data as SiteConfig;
}

export async function updateSiteConfig(styles: SiteConfig['styles']): Promise<void> {
    await supabase
        .from('site_config')
        .upsert({ id: 'main', styles, updated_at: new Date().toISOString() });
}

export async function addPotentialMember(
    conversation: PotentialMember['conversation'],
    score: number,
    ip: string
): Promise<string | null> {
    const { data, error } = await supabase
        .from('potential_members')
        .insert({ conversation, score, ip })
        .select('id')
        .single();

    if (error) return null;
    return data.id;
}

export async function getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data as Member[];
}

export async function getPotentialMembers(): Promise<PotentialMember[]> {
    const { data, error } = await supabase
        .from('potential_members')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data as PotentialMember[];
}
