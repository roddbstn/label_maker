import { supabaseAdmin } from './supabase';

export interface Submission {
    id: string;
    type: 'waitlist' | 'feedback';
    email?: string;
    feedback?: string;
    organization?: string;
    createdAt: string;
}

/**
 * Save submission to Supabase database
 * @param submission - Submission data without id and createdAt
 * @returns Saved submission with id and createdAt
 */
export const saveSubmission = async (
    submission: Omit<Submission, 'id' | 'createdAt'>
): Promise<Submission> => {
    try {
        const { data, error } = await supabaseAdmin
            .from('submissions')
            .insert({
                type: submission.type,
                email: submission.email || null,
                feedback: submission.feedback || null,
                organization: submission.organization || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error saving submission:', error);
            throw new Error('Failed to save submission to database');
        }

        return {
            id: data.id,
            type: data.type,
            email: data.email || undefined,
            feedback: data.feedback || undefined,
            organization: data.organization || undefined,
            createdAt: data.created_at,
        };
    } catch (error) {
        console.error('Error saving submission:', error);
        throw new Error('Failed to save submission');
    }
};

/**
 * Get all submissions from Supabase database
 * @returns Array of submissions sorted by creation date (newest first)
 */
export const getSubmissions = async (): Promise<Submission[]> => {
    try {
        const { data, error } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching submissions:', error);
            return [];
        }

        return data.map(row => ({
            id: row.id,
            type: row.type,
            email: row.email || undefined,
            feedback: row.feedback || undefined,
            organization: row.organization || undefined,
            createdAt: row.created_at,
        }));
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
};
