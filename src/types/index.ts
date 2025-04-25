export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    text: string;
    created_at: string;
    updated_at: string;
    sender?: User;
    receiver?: User;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}