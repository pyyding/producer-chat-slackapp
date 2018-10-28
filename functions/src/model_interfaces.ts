export interface PTask {
    text: string;
    createdAt: any;
    isDone: boolean;
    user: UserSummary;
}

export interface UserSummary {
    displayName: string;
    id: string;
    photoURL: string;
}