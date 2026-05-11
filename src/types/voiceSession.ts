export interface VoiceSession {
    joinedAt: number;
    mutedAt?: number | null;
    deafenedAt?: number | null;
    timeDeafened: number;
    timeMuted: number;
}
