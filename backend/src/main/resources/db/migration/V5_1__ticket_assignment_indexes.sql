create index idx_tickets_assigned_to_status on tickets (assigned_to, status);
create index idx_tickets_assigned_to_status_resolved_at on tickets (assigned_to, status, resolved_at);
