-- Create consultation_notes table for Manager consultation logs
-- This table stores important agreements and notes from WhatsApp conversations

CREATE TABLE IF NOT EXISTS consultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_consultation_notes_project_id ON consultation_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_manager_id ON consultation_notes(manager_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_created_at ON consultation_notes(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;

-- Managers can view notes for their assigned projects
CREATE POLICY "Managers can view notes for assigned projects"
    ON consultation_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = consultation_notes.project_id
            AND projects.manager_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
        )
    );

-- Managers can insert notes for their assigned projects
CREATE POLICY "Managers can insert notes for assigned projects"
    ON consultation_notes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = consultation_notes.project_id
            AND projects.manager_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
        )
    );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_consultation_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_notes_updated_at
    BEFORE UPDATE ON consultation_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_consultation_notes_updated_at();

