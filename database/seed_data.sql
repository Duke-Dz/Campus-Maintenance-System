-- CampusFix seed data for MySQL 8+
-- Idempotent: safe to run multiple times.

USE Campus_Fix;

START TRANSACTION;

SET @seed_password_hash = '$2a$10$oMPYGEHzq.21Trepj4/KK.47XQMQ38eRuMgZMKyMOehVijtsNUOAq';

-- -------------------------------------------------------------------------
-- Seed users
-- Password for all seeded users: password
-- -------------------------------------------------------------------------

INSERT INTO users (username, email, password_hash, role, full_name, email_verified, token_version, created_at)
SELECT 'admin_seed', 'admin.seed@campusfix.local', @seed_password_hash, 'ADMIN', 'Seed Admin', b'1', 0, NOW(6)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'admin_seed'
);

INSERT INTO users (username, email, password_hash, role, full_name, email_verified, token_version, created_at)
SELECT 'maintenance_seed', 'maintenance.seed@campusfix.local', @seed_password_hash, 'MAINTENANCE', 'Seed Maintenance', b'1', 0, NOW(6)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'maintenance_seed'
);

INSERT INTO users (username, email, password_hash, role, full_name, email_verified, token_version, created_at)
SELECT 'student_seed', 'student.seed@campusfix.local', @seed_password_hash, 'STUDENT', 'Seed Student', b'1', 0, NOW(6)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'student_seed'
);

SET @admin_id = (SELECT id FROM users WHERE username = 'admin_seed' LIMIT 1);
SET @maintenance_id = (SELECT id FROM users WHERE username = 'maintenance_seed' LIMIT 1);
SET @student_id = (SELECT id FROM users WHERE username = 'student_seed' LIMIT 1);

-- -------------------------------------------------------------------------
-- Seed buildings
-- -------------------------------------------------------------------------

INSERT INTO buildings (name, code, floors, active, created_at)
SELECT 'Main Library', 'LIB', 4, b'1', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE code = 'LIB');

INSERT INTO buildings (name, code, floors, active, created_at)
SELECT 'Engineering Block', 'ENG', 5, b'1', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE code = 'ENG');

INSERT INTO buildings (name, code, floors, active, created_at)
SELECT 'Science Complex', 'SCI', 3, b'1', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE code = 'SCI');

INSERT INTO buildings (name, code, floors, active, created_at)
SELECT 'Administration Wing', 'ADM', 2, b'1', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE code = 'ADM');

-- -------------------------------------------------------------------------
-- Seed announcements
-- -------------------------------------------------------------------------

INSERT INTO announcements (title, content, active, created_by, created_at)
SELECT
  '[SEED] Welcome to CampusFix',
  'CampusFix is now live. Submit campus maintenance issues and track progress from your dashboard.',
  b'1',
  @admin_id,
  NOW(6)
WHERE @admin_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM announcements WHERE title = '[SEED] Welcome to CampusFix'
  );

-- -------------------------------------------------------------------------
-- Seed tickets
-- -------------------------------------------------------------------------

INSERT INTO tickets (
  title,
  description,
  category,
  building,
  location,
  urgency,
  status,
  created_by,
  assigned_to,
  image_path,
  after_image_path,
  created_at,
  updated_at,
  resolved_at
)
SELECT
  '[SEED] Flickering lights in Library',
  'Lights in reading area on floor 2 are flickering continuously.',
  'ELECTRICAL',
  'Main Library',
  'Floor 2 - Reading Zone',
  'MEDIUM',
  'SUBMITTED',
  @student_id,
  NULL,
  NULL,
  NULL,
  NOW(6) - INTERVAL 2 DAY,
  NOW(6) - INTERVAL 2 DAY,
  NULL
WHERE @student_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tickets WHERE title = '[SEED] Flickering lights in Library'
  );

INSERT INTO tickets (
  title,
  description,
  category,
  building,
  location,
  urgency,
  status,
  created_by,
  assigned_to,
  image_path,
  after_image_path,
  created_at,
  updated_at,
  resolved_at
)
SELECT
  '[SEED] Leaking sink in Engineering Block',
  'Sink in washroom has a steady leak from the pipe joint.',
  'PLUMBING',
  'Engineering Block',
  'Floor 1 - East Washroom',
  'HIGH',
  'ASSIGNED',
  @student_id,
  @maintenance_id,
  NULL,
  NULL,
  NOW(6) - INTERVAL 1 DAY,
  NOW(6) - INTERVAL 20 HOUR,
  NULL
WHERE @student_id IS NOT NULL
  AND @maintenance_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tickets WHERE title = '[SEED] Leaking sink in Engineering Block'
  );

INSERT INTO tickets (
  title,
  description,
  category,
  building,
  location,
  urgency,
  status,
  created_by,
  assigned_to,
  image_path,
  after_image_path,
  created_at,
  updated_at,
  resolved_at
)
SELECT
  '[SEED] AC issue in Science Complex',
  'Air conditioning in Lab 3 is not cooling.',
  'HVAC',
  'Science Complex',
  'Lab 3',
  'CRITICAL',
  'RESOLVED',
  @student_id,
  @maintenance_id,
  NULL,
  NULL,
  NOW(6) - INTERVAL 3 DAY,
  NOW(6) - INTERVAL 1 DAY,
  NOW(6) - INTERVAL 1 DAY
WHERE @student_id IS NOT NULL
  AND @maintenance_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tickets WHERE title = '[SEED] AC issue in Science Complex'
  );

SET @ticket_1 = (SELECT id FROM tickets WHERE title = '[SEED] Flickering lights in Library' LIMIT 1);
SET @ticket_2 = (SELECT id FROM tickets WHERE title = '[SEED] Leaking sink in Engineering Block' LIMIT 1);
SET @ticket_3 = (SELECT id FROM tickets WHERE title = '[SEED] AC issue in Science Complex' LIMIT 1);

-- -------------------------------------------------------------------------
-- Seed ticket logs
-- -------------------------------------------------------------------------

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_1, NULL, 'SUBMITTED', @student_id, 'Ticket submitted by student', NOW(6) - INTERVAL 2 DAY
WHERE @ticket_1 IS NOT NULL
  AND @student_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_1
      AND new_status = 'SUBMITTED'
      AND note = 'Ticket submitted by student'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_2, NULL, 'SUBMITTED', @student_id, 'Ticket submitted by student', NOW(6) - INTERVAL 1 DAY
WHERE @ticket_2 IS NOT NULL
  AND @student_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_2
      AND new_status = 'SUBMITTED'
      AND note = 'Ticket submitted by student'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_2, 'SUBMITTED', 'APPROVED', @admin_id, 'Approved by admin', NOW(6) - INTERVAL 23 HOUR
WHERE @ticket_2 IS NOT NULL
  AND @admin_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_2
      AND new_status = 'APPROVED'
      AND note = 'Approved by admin'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_2, 'APPROVED', 'ASSIGNED', @admin_id, 'Assigned to maintenance team', NOW(6) - INTERVAL 22 HOUR
WHERE @ticket_2 IS NOT NULL
  AND @admin_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_2
      AND new_status = 'ASSIGNED'
      AND note = 'Assigned to maintenance team'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_3, NULL, 'SUBMITTED', @student_id, 'Ticket submitted by student', NOW(6) - INTERVAL 3 DAY
WHERE @ticket_3 IS NOT NULL
  AND @student_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_3
      AND new_status = 'SUBMITTED'
      AND note = 'Ticket submitted by student'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_3, 'SUBMITTED', 'APPROVED', @admin_id, 'Approved by admin', NOW(6) - INTERVAL 70 HOUR
WHERE @ticket_3 IS NOT NULL
  AND @admin_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_3
      AND new_status = 'APPROVED'
      AND note = 'Approved by admin'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_3, 'APPROVED', 'ASSIGNED', @admin_id, 'Assigned to maintenance team', NOW(6) - INTERVAL 68 HOUR
WHERE @ticket_3 IS NOT NULL
  AND @admin_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_3
      AND new_status = 'ASSIGNED'
      AND note = 'Assigned to maintenance team'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_3, 'ASSIGNED', 'IN_PROGRESS', @maintenance_id, 'Work started by maintenance', NOW(6) - INTERVAL 48 HOUR
WHERE @ticket_3 IS NOT NULL
  AND @maintenance_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_3
      AND new_status = 'IN_PROGRESS'
      AND note = 'Work started by maintenance'
  );

INSERT INTO ticket_logs (ticket_id, old_status, new_status, changed_by, note, `timestamp`)
SELECT @ticket_3, 'IN_PROGRESS', 'RESOLVED', @maintenance_id, 'Issue resolved', NOW(6) - INTERVAL 24 HOUR
WHERE @ticket_3 IS NOT NULL
  AND @maintenance_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM ticket_logs
    WHERE ticket_id = @ticket_3
      AND new_status = 'RESOLVED'
      AND note = 'Issue resolved'
  );

-- -------------------------------------------------------------------------
-- Seed rating and support request
-- -------------------------------------------------------------------------

INSERT INTO ticket_ratings (ticket_id, rated_by, stars, comment, created_at)
SELECT @ticket_3, @student_id, 5, 'Resolved quickly and professionally.', NOW(6) - INTERVAL 12 HOUR
WHERE @ticket_3 IS NOT NULL
  AND @student_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM ticket_ratings WHERE ticket_id = @ticket_3
  );

INSERT INTO support_requests (full_name, email, category, subject, message, created_at)
SELECT
  'Seed Student',
  'student.seed@campusfix.local',
  'Account',
  'Sample support request',
  'This is a sample support request created by seed_data.sql.',
  NOW(6) - INTERVAL 6 HOUR
WHERE NOT EXISTS (
  SELECT 1 FROM support_requests WHERE subject = 'Sample support request'
);

COMMIT;
