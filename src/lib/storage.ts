import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');

export interface Submission {
    id: string;
    type: 'waitlist' | 'feedback';
    email?: string;
    feedback?: string;
    organization?: string;
    createdAt: string;
}

export const getSubmissions = (): Submission[] => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading submissions:', error);
        return [];
    }
};

export const saveSubmission = (submission: Omit<Submission, 'id' | 'createdAt'>) => {
    try {
        const submissions = getSubmissions();
        const newSubmission: Submission = {
            ...submission,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        submissions.push(newSubmission);
        fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
        return newSubmission;
    } catch (error) {
        console.error('Error saving submission:', error);
        throw new Error('Failed to save submission');
    }
};
