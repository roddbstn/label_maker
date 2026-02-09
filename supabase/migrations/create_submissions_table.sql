-- Create submissions table for form data storage
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('waitlist', 'feedback')),
    email VARCHAR(255),
    feedback TEXT,
    organization VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_type ON submissions(type);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for form submissions from the public website)
CREATE POLICY "Allow anonymous inserts" ON submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON submissions
    FOR SELECT TO authenticated
    USING (true);

-- Allow service role full access (for server-side operations)
CREATE POLICY "Allow service role all" ON submissions
    TO service_role
    USING (true)
    WITH CHECK (true);
