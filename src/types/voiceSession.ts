export interface VoiceSession {
    username: string;
    joinedAt: number;
    mutedAt?: number | null;
    deafenedAt?: number | null;
    timeDeafened: number;
    timeMuted: number;
}
