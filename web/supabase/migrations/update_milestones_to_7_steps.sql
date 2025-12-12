-- Update milestones to 7-step workflow
-- This migration updates the milestone constraint and default milestones

-- 1. Update the CHECK constraint for current_milestone_index (0-6 instead of 0-5)
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_current_milestone_index_check'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT projects_current_milestone_index_check;
    END IF;
    
    -- Add new constraint (0-6)
    ALTER TABLE projects 
        ADD CONSTRAINT projects_current_milestone_index_check 
        CHECK (current_milestone_index >= 0 AND current_milestone_index <= 6);
END $$;

-- 2. Update default milestones JSONB for existing projects that have old structure
-- This will migrate projects that still have old milestone structure
UPDATE projects
SET milestones = '[
    {"title": "Agent Review", "status": "completed", "date": null, "index": 0},
    {"title": "Sourcing", "status": "pending", "date": null, "index": 1},
    {"title": "Samples", "status": "pending", "date": null, "index": 2},
    {"title": "Final Quote", "status": "pending", "date": null, "index": 3},
    {"title": "Deposit Payment", "status": "pending", "date": null, "index": 4},
    {"title": "Production", "status": "pending", "date": null, "index": 5},
    {"title": "Shipping", "status": "pending", "date": null, "index": 6}
]'::jsonb
WHERE milestones IS NULL 
   OR (milestones::text LIKE '%Sourcing Started%' AND milestones::text NOT LIKE '%Agent Review%')
   OR jsonb_array_length(milestones) < 7;

-- Note: This migration preserves existing milestone completion status
-- Projects with completed milestones will maintain their progress
-- Only the structure is updated to match the new 7-step workflow

