-- CampusFix v2 schema (MySQL 8+)
-- Creates a fresh database with tables matching the current backend entities.
-- Optional reset:
-- DROP DATABASE IF EXISTS Campus_Fix;

CREATE DATABASE IF NOT EXISTS Campus_Fix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Campus_Fix;

CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email_verified BIT(1) NOT NULL DEFAULT b'0',
  token_version INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE email_verification_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  code VARCHAR(16) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  used BIT(1) NOT NULL DEFAULT b'0',
  attempt_count INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_email_verification_tokens_user_id (user_id),
  KEY idx_email_verification_tokens_code (code),
  KEY idx_email_verification_tokens_used (used),
  KEY idx_email_verification_tokens_expires_at (expires_at),
  CONSTRAINT fk_email_verification_tokens_user_id FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE buildings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  floors INT NOT NULL DEFAULT 1,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_buildings_name (name),
  UNIQUE KEY uk_buildings_code (code),
  KEY idx_buildings_active (active)
) ENGINE=InnoDB;

CREATE TABLE tickets (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description LONGTEXT NOT NULL,
  category VARCHAR(30) NOT NULL,
  building VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  urgency VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_by BIGINT NOT NULL,
  assigned_to BIGINT DEFAULT NULL,
  image_path VARCHAR(255) DEFAULT NULL,
  after_image_path VARCHAR(255) DEFAULT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  resolved_at DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_tickets_status (status),
  KEY idx_tickets_category (category),
  KEY idx_tickets_urgency (urgency),
  KEY idx_tickets_created_by (created_by),
  KEY idx_tickets_assigned_to (assigned_to),
  KEY idx_tickets_created_at (created_at),
  CONSTRAINT fk_tickets_created_by FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT fk_tickets_assigned_to FOREIGN KEY (assigned_to) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE announcements (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  active BIT(1) NOT NULL DEFAULT b'1',
  created_by BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_announcements_active (active),
  KEY idx_announcements_created_by (created_by),
  KEY idx_announcements_created_at (created_at),
  CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message VARCHAR(500) NOT NULL,
  type VARCHAR(30) NOT NULL,
  is_read BIT(1) NOT NULL DEFAULT b'0',
  link_url VARCHAR(255) DEFAULT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_is_read (is_read),
  KEY idx_notifications_created_at (created_at),
  CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE ticket_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  old_status VARCHAR(20) DEFAULT NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by BIGINT NOT NULL,
  note VARCHAR(500) DEFAULT NULL,
  timestamp DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ticket_logs_ticket_id (ticket_id),
  KEY idx_ticket_logs_changed_by (changed_by),
  KEY idx_ticket_logs_timestamp (timestamp),
  CONSTRAINT fk_ticket_logs_ticket_id FOREIGN KEY (ticket_id) REFERENCES tickets (id),
  CONSTRAINT fk_ticket_logs_changed_by FOREIGN KEY (changed_by) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE ticket_comments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  content LONGTEXT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ticket_comments_ticket_id (ticket_id),
  KEY idx_ticket_comments_author_id (author_id),
  KEY idx_ticket_comments_created_at (created_at),
  CONSTRAINT fk_ticket_comments_ticket_id FOREIGN KEY (ticket_id) REFERENCES tickets (id),
  CONSTRAINT fk_ticket_comments_author_id FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE chat_messages (
  id BIGINT NOT NULL AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  content LONGTEXT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_chat_messages_ticket_id (ticket_id),
  KEY idx_chat_messages_sender_id (sender_id),
  KEY idx_chat_messages_created_at (created_at),
  CONSTRAINT fk_chat_messages_ticket_id FOREIGN KEY (ticket_id) REFERENCES tickets (id),
  CONSTRAINT fk_chat_messages_sender_id FOREIGN KEY (sender_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE ticket_ratings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  rated_by BIGINT NOT NULL,
  stars INT NOT NULL,
  comment VARCHAR(500) DEFAULT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ticket_ratings_ticket_id (ticket_id),
  KEY idx_ticket_ratings_rated_by (rated_by),
  KEY idx_ticket_ratings_created_at (created_at),
  CONSTRAINT fk_ticket_ratings_ticket_id FOREIGN KEY (ticket_id) REFERENCES tickets (id),
  CONSTRAINT fk_ticket_ratings_rated_by FOREIGN KEY (rated_by) REFERENCES users (id),
  CONSTRAINT chk_ticket_ratings_stars CHECK (stars BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE support_requests (
  id BIGINT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  message LONGTEXT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_support_requests_created_at (created_at),
  KEY idx_support_requests_email (email)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  token VARCHAR(64) NOT NULL,
  user_id BIGINT NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  used BIT(1) NOT NULL DEFAULT b'0',
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_password_reset_tokens_token (token),
  KEY idx_password_reset_tokens_user_id (user_id),
  KEY idx_password_reset_tokens_used (used),
  KEY idx_password_reset_tokens_expires_at (expires_at),
  CONSTRAINT fk_password_reset_tokens_user_id FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;
