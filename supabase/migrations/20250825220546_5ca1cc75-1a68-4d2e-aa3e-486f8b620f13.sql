-- Insert sample company "Vendor 01"
INSERT INTO companies (slug, name, active) 
VALUES ('vendor-01', 'Vendor 01', true)
ON CONFLICT (slug) DO NOTHING;

-- Get the company ID for further insertions
DO $$
DECLARE
    vendor_company_id uuid;
BEGIN
    SELECT id INTO vendor_company_id FROM companies WHERE slug = 'vendor-01';
    
    -- Insert sample crew "Linecrew Alpha"
    INSERT INTO crews (crew_name, company_id, active)
    VALUES ('Linecrew Alpha', vendor_company_id, true)
    ON CONFLICT DO NOTHING;
END $$;

-- Create hours breakdown table for detailed time tracking
CREATE TABLE IF NOT EXISTS public.hours_breakdown (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    time_entry_id uuid REFERENCES time_entries(id) ON DELETE CASCADE,
    member_id uuid REFERENCES crew_members(id) ON DELETE CASCADE,
    breakdown_type text NOT NULL, -- e.g., 'travel', 'setup', 'work', 'cleanup', 'break'
    hours numeric NOT NULL DEFAULT 0,
    description text,
    start_time time without time zone,
    end_time time without time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on hours breakdown table
ALTER TABLE public.hours_breakdown ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for hours breakdown - users can read from their company
CREATE POLICY "Users can read hours breakdown from their company"
ON public.hours_breakdown
FOR SELECT
USING (
    time_entry_id IN (
        SELECT te.id 
        FROM time_entries te
        JOIN crews c ON te.crew_id = c.id
        WHERE c.company_id IN (
            SELECT users.company_id 
            FROM users 
            WHERE users.id = auth.uid()
        )
    )
);

-- Create policy for utilities to access all hours breakdown data
CREATE POLICY "Utilities can read all hours breakdown"
ON public.hours_breakdown
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'utility'
    )
);

-- Update companies table policies to allow utilities to read all companies
CREATE POLICY "Utilities can read all companies"
ON public.companies
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'utility'
    )
);

-- Update crews table policies to allow utilities to read all crews
CREATE POLICY "Utilities can read all crews"
ON public.crews
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'utility'
    )
);

-- Update crew_members table policies to allow utilities to read all crew members
CREATE POLICY "Utilities can read all crew members"
ON public.crew_members
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'utility'
    )
);

-- Update time_entries table policies to allow utilities to read all time entries
CREATE POLICY "Utilities can read all time entries"
ON public.time_entries
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'utility'
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hours_breakdown_time_entry_id ON hours_breakdown(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_hours_breakdown_member_id ON hours_breakdown(member_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_crew_member ON time_entries(crew_id, member_id);