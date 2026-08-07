export interface VoteRequest {
    itemId: number;
    rating: number;
}

export interface VoteResponse {
    success: boolean;
    message: string;
    progress?: number;
}

export interface UserProgress {
    count: number;
    isCompleted: boolean;
}
