
-- Add test lab results for Metro General Hospital
INSERT INTO lab_results (
  id, tenant_id, patient_id, lab_order_id, test_name, result, unit, normal_range, 
  abnormal_flag, status, performed_by, completed_at, reported_at, notes,
  lab_tenant_id, created_at, updated_at
) VALUES 
  (gen_random_uuid(), '37a1f504-6f59-4d2f-9eec-d108cd2b83d7', 
   (SELECT id FROM patients WHERE first_name = 'John' AND last_name = 'Smith' LIMIT 1),
   gen_random_uuid(), 'Blood Panel', '7.4', 'pH', '7.35-7.45', 
   'normal', 'pending', 'Dr. Lab Technician', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
   'Complete blood panel shows normal values',
   '37a1f504-6f59-4d2f-9eec-d108cd2b83d7', NOW(), NOW()),
   
  (gen_random_uuid(), '37a1f504-6f59-4d2f-9eec-d108cd2b83d7',
   (SELECT id FROM patients WHERE first_name = 'Sarah' AND last_name = 'Johnson' LIMIT 1),
   gen_random_uuid(), 'X-Ray Chest', 'Clear', '', 'Normal lung fields', 
   'normal', 'pending', 'Radiology Tech', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
   'No abnormalities detected in chest X-ray',
   '37a1f504-6f59-4d2f-9eec-d108cd2b83d7', NOW(), NOW()),
   
  (gen_random_uuid(), '37a1f504-6f59-4d2f-9eec-d108cd2b83d7',
   (SELECT id FROM patients WHERE first_name = 'Mike' AND last_name = 'Wilson' LIMIT 1),
   gen_random_uuid(), 'Cardiac Stress Test', 'Positive', '', 'Abnormal response', 
   'abnormal', 'pending', 'Cardiac Tech', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours',
   'Stress test shows abnormal cardiac response - requires follow-up',
   '37a1f504-6f59-4d2f-9eec-d108cd2b83d7', NOW(), NOW()),
   
  (gen_random_uuid(), '37a1f504-6f59-4d2f-9eec-d108cd2b83d7',
   (SELECT id FROM patients WHERE first_name = 'Emma' AND last_name = 'Davis' LIMIT 1),
   gen_random_uuid(), 'Urine Analysis', 'Normal', '', 'Within normal limits', 
   'normal', 'pending', 'Lab Assistant', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
   'Routine urine analysis - all parameters normal',
   '37a1f504-6f59-4d2f-9eec-d108cd2b83d7', NOW(), NOW())
ON CONFLICT DO NOTHING;
