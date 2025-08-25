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