// ==========================================
// Database Types
// ==========================================

export interface Database {
    public: {
        Tables: {
            mandi_entries: {
                Row: MandiEntry;
                Insert: MandiEntryInsert;
                Update: MandiEntryUpdate;
            };
        };
    };
}

export interface MandiEntry {
    id: string;
    user_id: string;
    date: string;
    location: string;
    total_amount: number;
    number_of_people: number;
    per_person_cost: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface MandiEntryInsert {
    user_id: string;
    date?: string;
    location: string;
    total_amount: number;
    number_of_people: number;
    per_person_cost: number;
    notes?: string | null;
}

export interface MandiEntryUpdate {
    date?: string;
    location?: string;
    total_amount?: number;
    number_of_people?: number;
    per_person_cost?: number;
    notes?: string | null;
}

// ==========================================
// Form and UI Types
// ==========================================

export interface MandiFormData {
    location: string;
    totalAmount: string;
    numberOfPeople: number;
    date: string;
    notes: string;
}

// ==========================================
// Analytics Types
// ==========================================

export interface PeriodStats {
    totalSpent: number;
    averagePerMeal: number;
    totalCount: number;
    averageGroupSize: number;
}

export interface LocationStats {
    location: string;
    visitCount: number;
    totalSpent: number;
    percentage: number;
}

export type TimePeriod = 'weekly' | 'monthly' | 'yearly';

// ==========================================
// Authentication Types
// ==========================================

export interface AuthUser {
    id: string;
    email: string | undefined;
}

// ==========================================
// Component Props Types
// ==========================================

export interface EntryCardProps {
    entry: MandiEntry;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export interface StatCardProps {
    title: string;
    value: string | number;
    icon?: string;
    subtitle?: string;
}

export interface ProtectedRouteProps {
    children: React.ReactNode;
}

export interface MandiEntryFormProps {
    id?: string;
}

// ==========================================
// Utility Types
// ==========================================

export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
