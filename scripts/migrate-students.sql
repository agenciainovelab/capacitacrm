
-- Migration: Create students table
-- This should be run manually in your PostgreSQL database

-- Enable citext extension if not already enabled
CREATE EXTENSION IF NOT EXISTS citext;

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp timestamptz NULL,
    name text NOT NULL,
    gender text NULL,
    phone text NULL,
    birth_date date NULL,
    email citext NOT NULL,
    city text NULL,
    address text NULL,
    discovery_source text NULL,
    study_preference text NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT unique_student_email UNIQUE(email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON public.students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
