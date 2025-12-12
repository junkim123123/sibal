-- Add internal_notes column to projects table
-- This column stores private notes visible only to managers

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN projects.internal_notes IS 'Private notes visible only to managers, for tracking client preferences and internal information';

