CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_ticket_status ON tickets(status);
CREATE INDEX idx_ticket_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_ticket_created_by ON tickets(created_by);
CREATE INDEX idx_ticket_log_ticket_id ON ticket_logs(ticket_id);