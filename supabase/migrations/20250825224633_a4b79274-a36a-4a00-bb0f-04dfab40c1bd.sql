-- Create a sample user with a valid role
INSERT INTO users (id, email, username, full_name, role, company_id, active) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@example.com',
  'demo_user',
  'Demo User',
  'Admin',
  '0e4fb850-d5be-4029-9da9-0dabc1bb42ea',
  true
);

-- Create sample crew members for the existing crew
INSERT INTO crew_members (id, crew_id, name, role, hourly_rate, active) VALUES
  ('00000000-0000-0000-0000-000000000001', '8685dabc-746e-4fe8-90a3-c41035c79dc0', 'You', 'crew_lead', 35.00, true),
  ('00000000-0000-0000-0000-000000000002', '8685dabc-746e-4fe8-90a3-c41035c79dc0', 'Alex Johnson', 'lineman', 30.00, true),
  ('00000000-0000-0000-0000-000000000003', '8685dabc-746e-4fe8-90a3-c41035c79dc0', 'Sarah Davis', 'lineman', 30.00, true),
  ('00000000-0000-0000-0000-000000000004', '8685dabc-746e-4fe8-90a3-c41035c79dc0', 'Mike Rodriguez', 'equipment_operator', 32.00, true),
  ('00000000-0000-0000-0000-000000000005', '8685dabc-746e-4fe8-90a3-c41035c79dc0', 'Emma Wilson', 'lineman', 30.00, true),
  ('00000000-0000-0000-0000-000000000006', '8685dabc-746e-4fe8-90a3-c41035c79dc0', 'David Brown', 'lineman', 30.00, true);

-- Add a more permissive RLS policy for demo purposes
CREATE POLICY "Allow anonymous time entry creation for demo" 
ON time_entries 
FOR INSERT 
WITH CHECK (
  -- Allow if no authentication (for demo purposes)
  auth.uid() IS NULL OR 
  -- OR if authenticated user owns the crew
  crew_id IN (
    SELECT crews.id
    FROM crews
    WHERE crews.company_id IN (
      SELECT users.company_id
      FROM users
      WHERE users.id = auth.uid()
    )
  )
);