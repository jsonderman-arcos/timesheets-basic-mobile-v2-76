-- Add INSERT and UPDATE policies for time_entries to allow crew members to track time
CREATE POLICY "Users can create time entries for their company crews"
ON public.time_entries
FOR INSERT
WITH CHECK (
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

CREATE POLICY "Users can update time entries for their company crews"
ON public.time_entries
FOR UPDATE
USING (
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

-- Add INSERT and UPDATE policies for hours_breakdown
CREATE POLICY "Users can create hours breakdown for their company"
ON public.hours_breakdown
FOR INSERT
WITH CHECK (
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

CREATE POLICY "Users can update hours breakdown for their company"
ON public.hours_breakdown
FOR UPDATE
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

-- Add sample time entries for demonstration
DO $$
DECLARE
    linecrew_alpha_id uuid;
    john_smith_id uuid;
    mike_johnson_id uuid;
    time_entry_1_id uuid;
    time_entry_2_id uuid;
BEGIN
    -- Get IDs
    SELECT id INTO linecrew_alpha_id FROM crews WHERE crew_name = 'Linecrew Alpha';
    SELECT id INTO john_smith_id FROM crew_members WHERE name = 'John Smith';
    SELECT id INTO mike_johnson_id FROM crew_members WHERE name = 'Mike Johnson';
    
    -- Insert sample time entries
    INSERT INTO time_entries (
        crew_id, member_id, date, start_time, end_time, 
        hours_regular, location, work_description, status
    ) VALUES 
    (linecrew_alpha_id, john_smith_id, CURRENT_DATE, '08:00:00', '16:00:00', 
     8.0, 'Main Street Power Lines', 'Routine maintenance and inspection', 'submitted'),
    (linecrew_alpha_id, mike_johnson_id, CURRENT_DATE, '08:00:00', '15:30:00', 
     7.5, 'Industrial District', 'Emergency repair - damaged transformer', 'submitted')
    RETURNING id INTO time_entry_1_id, time_entry_2_id;
    
    -- Get the actual IDs from the inserted records
    SELECT id INTO time_entry_1_id FROM time_entries WHERE member_id = john_smith_id AND date = CURRENT_DATE LIMIT 1;
    SELECT id INTO time_entry_2_id FROM time_entries WHERE member_id = mike_johnson_id AND date = CURRENT_DATE LIMIT 1;
    
    -- Insert detailed hours breakdown for time_entry_1_id (John Smith)
    INSERT INTO hours_breakdown (time_entry_id, member_id, breakdown_type, hours, description, start_time, end_time) VALUES
    (time_entry_1_id, john_smith_id, 'travel', 0.5, 'Drive to job site', '08:00:00', '08:30:00'),
    (time_entry_1_id, john_smith_id, 'setup', 0.5, 'Equipment setup and safety check', '08:30:00', '09:00:00'),
    (time_entry_1_id, john_smith_id, 'work', 6.0, 'Power line maintenance and inspection', '09:00:00', '15:00:00'),
    (time_entry_1_id, john_smith_id, 'cleanup', 0.5, 'Equipment cleanup and storage', '15:00:00', '15:30:00'),
    (time_entry_1_id, john_smith_id, 'travel', 0.5, 'Return to base', '15:30:00', '16:00:00');
    
    -- Insert detailed hours breakdown for time_entry_2_id (Mike Johnson)
    INSERT INTO hours_breakdown (time_entry_id, member_id, breakdown_type, hours, description, start_time, end_time) VALUES
    (time_entry_2_id, mike_johnson_id, 'travel', 0.5, 'Emergency response travel', '08:00:00', '08:30:00'),
    (time_entry_2_id, mike_johnson_id, 'assessment', 1.0, 'Damage assessment and planning', '08:30:00', '09:30:00'),
    (time_entry_2_id, mike_johnson_id, 'work', 5.5, 'Transformer replacement and testing', '09:30:00', '15:00:00'),
    (time_entry_2_id, mike_johnson_id, 'travel', 0.5, 'Return to base', '15:00:00', '15:30:00');
END $$;