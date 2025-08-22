-- Create demo data for presentation purposes
-- Insert demo company
INSERT INTO public.companies (id, name, slug, active) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Demo Storm Response Company', 'demo-storm-company', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo utility contract
INSERT INTO public.utility_contracts (id, company_id, utility_name, contract_number, region, storm_event, start_date, end_date, active)
VALUES ('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'Florida Power & Light', 'FPL-2024-001', 'South Florida', 'Hurricane Ian Recovery', '2024-01-01', '2024-12-31', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo storm event (using valid phase: 'response' instead of 'restoration')
INSERT INTO public.storm_events (id, utility_contract_id, storm_name, event_type, status, phase, start_date, end_date, estimated_cost, active)
VALUES ('323e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', 'Hurricane Ian', 'hurricane', 'active', 'response', '2024-08-15', NULL, 500000.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo user (supervisor)
INSERT INTO public.users (id, email, username, full_name, role, company_id, active)
VALUES ('423e4567-e89b-12d3-a456-426614174000', 'supervisor@demo.com', 'supervisor', 'John Supervisor', 'supervisor', '123e4567-e89b-12d3-a456-426614174000', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo crew
INSERT INTO public.crews (id, company_id, supervisor_id, crew_name, storm_event_id, utility_contract_id, equipment_assigned, active)
VALUES ('523e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174000', 'Alpha Crew', '323e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000', ARRAY['Bucket Truck', 'Generator', 'Safety Equipment'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo crew members
INSERT INTO public.crew_members (id, crew_id, name, role, hourly_rate, active) VALUES
('623e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174000', 'You', 'lead_technician', 35.00, true),
('623e4567-e89b-12d3-a456-426614174002', '523e4567-e89b-12d3-a456-426614174000', 'Alex Johnson', 'lineman', 32.00, true),
('623e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174000', 'Sarah Davis', 'technician', 28.00, true),
('623e4567-e89b-12d3-a456-426614174004', '523e4567-e89b-12d3-a456-426614174000', 'Mike Rodriguez', 'lineman', 32.00, true),
('623e4567-e89b-12d3-a456-426614174005', '523e4567-e89b-12d3-a456-426614174000', 'Emma Wilson', 'technician', 28.00, true),
('623e4567-e89b-12d3-a456-426614174006', '523e4567-e89b-12d3-a456-426614174000', 'David Brown', 'apprentice', 25.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo time entries for today
INSERT INTO public.time_entries (id, crew_id, member_id, date, start_time, end_time, hours_regular, hours_overtime, status, location, work_description, comments)
VALUES 
('723e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174001', CURRENT_DATE, '09:00:00', '17:00:00', 8.0, 0, 'submitted', 'Pembroke Pines Substation', 'Power line restoration after storm damage', 'Completed primary repairs'),
('723e4567-e89b-12d3-a456-426614174002', '523e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174002', CURRENT_DATE, '09:00:00', '17:00:00', 8.0, 0, 'submitted', 'Pembroke Pines Substation', 'Power line restoration after storm damage', NULL),
('723e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174003', CURRENT_DATE, '09:00:00', '17:00:00', 8.0, 0, 'submitted', 'Pembroke Pines Substation', 'Power line restoration after storm damage', NULL),
('723e4567-e89b-12d3-a456-426614174004', '523e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174004', CURRENT_DATE, '09:00:00', '17:00:00', 8.0, 0, 'submitted', 'Pembroke Pines Substation', 'Power line restoration after storm damage', NULL),
('723e4567-e89b-12d3-a456-426614174005', '523e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174005', CURRENT_DATE, '09:00:00', '17:00:00', 8.0, 0, 'submitted', 'Pembroke Pines Substation', 'Power line restoration after storm damage', NULL),
('723e4567-e89b-12d3-a456-426614174006', '523e4567-e89b-12d3-a456-426614174000', '623e4567-e89b-12d3-a456-426614174006', CURRENT_DATE, '09:00:00', '17:00:00', 8.0, 0, 'submitted', 'Pembroke Pines Substation', 'Power line restoration after storm damage', NULL)
ON CONFLICT (id) DO NOTHING;

-- Create demo-friendly RLS policies that allow public read access for presentation
DROP POLICY IF EXISTS "Public read access for demo" ON public.companies;
DROP POLICY IF EXISTS "Public read access for demo" ON public.crews;
DROP POLICY IF EXISTS "Public read access for demo" ON public.crew_members;
DROP POLICY IF EXISTS "Public read access for demo" ON public.time_entries;
DROP POLICY IF EXISTS "Public read access for demo" ON public.utility_contracts;
DROP POLICY IF EXISTS "Public read access for demo" ON public.storm_events;
DROP POLICY IF EXISTS "Public read access for demo" ON public.users;
DROP POLICY IF EXISTS "Public write access for demo" ON public.time_entries;
DROP POLICY IF EXISTS "Public update access for demo" ON public.time_entries;

CREATE POLICY "Public read access for demo" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Public read access for demo" ON public.crews FOR SELECT USING (true);  
CREATE POLICY "Public read access for demo" ON public.crew_members FOR SELECT USING (true);
CREATE POLICY "Public read access for demo" ON public.time_entries FOR SELECT USING (true);
CREATE POLICY "Public read access for demo" ON public.utility_contracts FOR SELECT USING (true);
CREATE POLICY "Public read access for demo" ON public.storm_events FOR SELECT USING (true);
CREATE POLICY "Public read access for demo" ON public.users FOR SELECT USING (true);

-- Allow public insert/update for demo purposes (time entries)
CREATE POLICY "Public write access for demo" ON public.time_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for demo" ON public.time_entries FOR UPDATE USING (true);