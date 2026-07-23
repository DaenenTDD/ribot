export interface Job {
    interval: number;
    job(...args: any[]): Promise<void>;
}
