-- Add phone and telegram_id fields to profiles table for manager contact info
-- This migration adds fields needed for WhatsApp/Telegram integration

-- Add phone field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Add telegram_id field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'telegram_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN telegram_id TEXT;
    END IF;
END $$;

-- Add full_name field if it doesn't exist (for display purposes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

