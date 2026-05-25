-- ============================================================
--  V8 — Add schema elements that were consolidated into V1
--       but never applied to databases built from V1–V7.
-- ============================================================

-- 1. Tickets: assignment-review columns
ALTER TABLE tickets
    ADD COLUMN assignment_review_required BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN assignment_review_reason   VARCHAR(40) NULL;

-- 2. Technician specialties (join table)
CREATE TABLE IF NOT EXISTS user_specialties (
    user_id   BIGINT      NOT NULL,
    specialty VARCHAR(40) NOT NULL,
    CONSTRAINT fk_user_specialties_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY ux_user_specialties_user_specialty (user_id, specialty)
);

-- 3. Staff-invite specialties (join table)
CREATE TABLE IF NOT EXISTS staff_invite_specialties (
    staff_invite_id BIGINT      NOT NULL,
    specialty       VARCHAR(40) NOT NULL,
    CONSTRAINT fk_staff_invite_specialties_invite FOREIGN KEY (staff_invite_id) REFERENCES staff_invites (id) ON DELETE CASCADE,
    UNIQUE KEY ux_staff_invite_specialties_invite_specialty (staff_invite_id, specialty)
);
