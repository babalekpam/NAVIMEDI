-- NaviMED Database Seeding Script
-- Run this to initialize the database with super admin account

-- Clean slate
DELETE FROM users;
DELETE FROM tenants;
DELETE FROM countries;

-- Step 1: Insert Nigeria country
INSERT INTO countries (code, name, region, cpt_code_system, icd10_code_system, pharmaceutical_code_system, currency_code, date_format, time_zone, is_active)
VALUES ('NG', 'Nigeria', 'Africa', 'CPT-4', 'ICD-10', 'ATC', 'NGN', 'DD/MM/YYYY', 'Africa/Lagos', true);

-- Step 2: Insert platform tenant WITH country_id from Nigeria
INSERT INTO tenants (name, type, subdomain, country_id, settings, is_active)
SELECT 'ARGILETTE Platform', 'hospital', 'argilette', id, '{"isPlatformOwner":true}'::jsonb, true
FROM countries WHERE code = 'NG';

-- Step 3: Insert super admin user
INSERT INTO users (tenant_id, username, email, password, first_name, last_name, role, is_active)
SELECT t.id, 'abel_admin', 'abel@argilette.com',
'$2b$10$YqHqEm5hLqWQq6R5yGQZqOYxVJXK.zGXH1dKLvHxJZPWqYFqHqEm2',
'Abel', 'Platform Admin', 'super_admin', true
FROM tenants t WHERE t.subdomain = 'argilette';

-- Verify
SELECT 'Database seeded successfully!' as status;
SELECT COUNT(*) as country_count FROM countries;
SELECT COUNT(*) as tenant_count FROM tenants;
SELECT COUNT(*) as super_admin_count FROM users WHERE role = 'super_admin';
