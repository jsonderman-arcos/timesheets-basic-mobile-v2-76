-- Add a permissive RLS policy for demo purposes that allows anonymous inserts
CREATE POLICY "Allow anonymous time entry creation for demo" 
ON time_entries 
FOR INSERT 
WITH CHECK (true);