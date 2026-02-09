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
        // Ensure data directory exists
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            console.log('Creating data directory:', dataDir);
            fs.mkdirSync(dataDir, { recursive: true });
        }

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
        console.error('Current working directory:', process.cwd());
        console.error('Attempted file path:', DATA_FILE);
        throw new Error('Failed to save submission');
    }
};
