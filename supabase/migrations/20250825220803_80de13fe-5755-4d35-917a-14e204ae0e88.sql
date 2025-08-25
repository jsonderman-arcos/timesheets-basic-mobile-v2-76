-- Add sample crew members to Linecrew Alpha
DO $$
DECLARE
    linecrew_alpha_id uuid;
BEGIN
    -- Get the Linecrew Alpha ID
    SELECT id INTO linecrew_alpha_id 
    FROM crews 
    WHERE crew_name = 'Linecrew Alpha' 
    AND company_id = (SELECT id FROM companies WHERE slug = 'vendor-01');
    
    -- Insert sample crew members
    INSERT INTO crew_members (crew_id, name, role, hourly_rate, active) VALUES
    (linecrew_alpha_id, 'John Smith', 'Crew Leader', 45.00, true),
    (linecrew_alpha_id, 'Mike Johnson', 'Lineman', 35.00, true),
    (linecrew_alpha_id, 'Sarah Williams', 'Apprentice', 25.00, true),
    (linecrew_alpha_id, 'David Brown', 'Equipment Operator', 40.00, true);
END $$;