-- ============================================================================
-- NexSupply AI Analyzer - Seed Data
-- ============================================================================
--
-- This script populates the database with dummy data for local development
-- and testing.
--
-- Usage:
-- 1. Run the schema.sql script first to set up the tables.
-- 2. Run this script in the Supabase SQL Editor to insert the seed data.
--
-- ============================================================================

-- ============================================================================
-- 1. Create Test Users
-- ============================================================================
-- Note: Users are created in auth.users, and the profiles table is populated
-- automatically by a trigger. We will update the roles in the profiles table
-- after the users are created.

-- User 1: Free User
INSERT INTO auth.users (id, email, encrypted_password, role, aud)
VALUES ('00000000-0000-0000-0000-000000000001', 'free.user@example.com', crypt('password123', gen_salt('bf')), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- User 2: Pro User
INSERT INTO auth.users (id, email, encrypted_password, role, aud)
VALUES ('00000000-0000-0000-0000-000000000002', 'pro.user@example.com', crypt('password123', gen_salt('bf')), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- User 3: Manager User (Placeholder)
-- Note: The 'manager' role is not defined in the schema.sql.
-- This user is created as a 'free' user for now. The application logic
-- will need to be updated to handle the 'manager' role.
INSERT INTO auth.users (id, email, encrypted_password, role, aud)
VALUES ('00000000-0000-0000-0000-000000000003', 'manager.user@example.com', crypt('password123', gen_salt('bf')), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Update user roles in the profiles table
UPDATE public.profiles
SET role = 'pro'
WHERE id = '00000000-0000-0000-0000-000000000002';

-- ============================================================================
-- 2. Create Fake Project Data
-- ============================================================================

-- Project 1: Completed Project for Pro User
INSERT INTO public.projects (id, user_id, name, status, initial_risk_score, total_landed_cost)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Project Alpha (Completed)', 'completed', 85.5, 125000.00);

-- Project 2: Active Project for Pro User
INSERT INTO public.projects (id, user_id, name, status, initial_risk_score, total_landed_cost)
VALUES ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Project Beta (Active)', 'active', 62.0, 75000.00);

-- Project 3: Active Project for Free User
INSERT INTO public.projects (id, user_id, name, status, initial_risk_score, total_landed_cost)
VALUES ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Project Gamma (Free)', 'active', 78.0, 92000.00);


-- ============================================================================
-- 3. Create Chat History
-- ============================================================================

-- Chat History for Project 1 (Completed)
INSERT INTO public.messages (project_id, role, content)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'user', 'What are the risks associated with shipping from Shanghai?'),
    ('11111111-1111-1111-1111-111111111111', 'ai', 'Shipping from Shanghai has a high risk of delays due to port congestion. I recommend considering alternative ports or shipping methods.'),
    ('11111111-1111-1111-1111-111111111111', 'user', 'Okay, what is the estimated landed cost for this shipment?'),
    ('11111111-1111-1111-1111-111111111111', 'ai', 'The estimated total landed cost is $125,000.00, including tariffs, taxes, and fees.');

-- Chat History for Project 2 (Active)
INSERT INTO public.messages (project_id, role, content)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'user', 'Analyze the attached bill of lading.'),
    ('22222222-2222-2222-2222-222222222222', 'ai', 'Analysis complete. The bill of lading appears to be in order, but I have identified a potential issue with the listed Harmonized System (HS) code. It may be incorrect, leading to higher tariffs.');

-- ============================================================================
-- Seed data insertion complete.
-- ============================================================================