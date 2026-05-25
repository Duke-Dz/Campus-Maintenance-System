-- ============================================================
--  CampusFix — Complete Database Schema
--  Flyway managed. Run via Spring Boot on first startup.
-- ============================================================

-- Users
create table if not exists users (
    id                  bigint auto_increment primary key,
    username            varchar(50)  not null unique,
    email               varchar(120) not null unique,
    password_hash       varchar(255) not null,
    role                varchar(20)  not null,
    full_name           varchar(120) not null,
    email_verified      boolean      not null default false,
    token_version       int          not null default 0,
    mfa_enabled         boolean      not null default false,
    department_name     varchar(120) null,
    phone_extension     varchar(40)  null,
    avatar_type         varchar(20)  null,
    avatar_preset       varchar(40)  null,
    avatar_image_path   varchar(255) null,
    primary_building_id bigint       null,
    created_at          datetime(6)  not null
);

-- Buildings
create table if not exists buildings (
    id         bigint auto_increment primary key,
    name       varchar(100) not null unique,
    code       varchar(20)  not null unique,
    floors     int          not null,
    active     boolean      not null default true,
    sort_order int          not null default 0,
    created_at datetime(6)  not null
);

alter table users
    add constraint fk_users_primary_building
    foreign key (primary_building_id) references buildings (id);

create index idx_users_primary_building on users (primary_building_id);

-- Service catalog
create table if not exists service_domains (
    id         bigint auto_increment primary key,
    domain_key varchar(40) not null unique,
    label      varchar(80) not null,
    sort_order int         not null default 0,
    created_at datetime(6) not null
);

create table if not exists request_types (
    id                bigint auto_increment primary key,
    service_domain_id bigint       not null,
    label             varchar(120) not null,
    active            boolean      not null default true,
    sort_order        int          not null default 0,
    created_at        datetime(6)  not null,
    constraint fk_request_types_service_domain foreign key (service_domain_id) references service_domains (id),
    constraint uk_request_types_domain_label unique (service_domain_id, label)
);

create table if not exists support_categories (
    id         bigint auto_increment primary key,
    label      varchar(120) not null unique,
    active     boolean      not null default true,
    sort_order int          not null default 0,
    created_at datetime(6)  not null
);

-- Tickets
create table if not exists tickets (
    id                       bigint auto_increment primary key,
    title                    varchar(150) not null,
    description              longtext     not null,
    category                 varchar(30)  not null,
    building                 varchar(120) not null,
    building_id              bigint       null,
    request_type_id          bigint       null,
    location                 varchar(120) not null,
    urgency                  varchar(20)  not null,
    status                   varchar(20)  not null,
    created_by               bigint       not null,
    assigned_to              bigint       null,
    image_path               varchar(255) null,
    after_image_path         varchar(255) null,
    assignment_review_required boolean    not null default false,
    assignment_review_reason varchar(40)  null,
    created_at               datetime(6)  not null,
    updated_at               datetime(6)  not null,
    resolved_at              datetime(6)  null,
    constraint fk_tickets_created_by  foreign key (created_by)      references users (id),
    constraint fk_tickets_assigned_to foreign key (assigned_to)     references users (id),
    constraint fk_tickets_building    foreign key (building_id)     references buildings (id),
    constraint fk_tickets_request_type foreign key (request_type_id) references request_types (id)
);

create index idx_tickets_building_id      on tickets (building_id);
create index idx_tickets_request_type_id  on tickets (request_type_id);
create index idx_tickets_assigned_to_status            on tickets (assigned_to, status);
create index idx_tickets_assigned_to_status_resolved_at on tickets (assigned_to, status, resolved_at);

-- Technician specialties
create table if not exists user_specialties (
    user_id   bigint      not null,
    specialty varchar(40) not null,
    constraint fk_user_specialties_user foreign key (user_id) references users (id) on delete cascade
);

create unique index ux_user_specialties_user_specialty on user_specialties (user_id, specialty);

-- Ticket logs, ratings, comments
create table if not exists ticket_logs (
    id         bigint auto_increment primary key,
    ticket_id  bigint       not null,
    old_status varchar(20)  null,
    new_status varchar(20)  not null,
    changed_by bigint       not null,
    note       varchar(500) null,
    `timestamp` datetime(6) not null,
    constraint fk_ticket_logs_ticket     foreign key (ticket_id)  references tickets (id),
    constraint fk_ticket_logs_changed_by foreign key (changed_by) references users (id)
);

create table if not exists ticket_ratings (
    id         bigint auto_increment primary key,
    ticket_id  bigint       not null unique,
    rated_by   bigint       not null,
    stars      int          not null,
    comment    varchar(500) null,
    created_at datetime(6)  not null,
    constraint fk_ticket_ratings_ticket   foreign key (ticket_id) references tickets (id),
    constraint fk_ticket_ratings_rated_by foreign key (rated_by)  references users (id)
);

create table if not exists ticket_comments (
    id         bigint auto_increment primary key,
    ticket_id  bigint     not null,
    author_id  bigint     not null,
    content    text       not null,
    created_at datetime(6) not null,
    constraint fk_ticket_comments_ticket foreign key (ticket_id) references tickets (id),
    constraint fk_ticket_comments_author foreign key (author_id) references users (id)
);

-- Notifications and announcements
create table if not exists notifications (
    id         bigint auto_increment primary key,
    user_id    bigint       not null,
    title      varchar(200) not null,
    message    varchar(500) not null,
    type       varchar(30)  not null,
    is_read    boolean      not null default false,
    link_url   varchar(255) null,
    created_at datetime(6)  not null,
    constraint fk_notifications_user foreign key (user_id) references users (id)
);

create table if not exists announcements (
    id         bigint auto_increment primary key,
    title      varchar(200) not null,
    content    text         not null,
    active     boolean      not null default true,
    created_by bigint       not null,
    created_at datetime(6)  not null,
    constraint fk_announcements_created_by foreign key (created_by) references users (id)
);

-- Chat
create table if not exists chat_messages (
    id         bigint auto_increment primary key,
    ticket_id  bigint     not null,
    sender_id  bigint     not null,
    content    text       not null,
    created_at datetime(6) not null,
    constraint fk_chat_messages_ticket foreign key (ticket_id) references tickets (id),
    constraint fk_chat_messages_sender foreign key (sender_id) references users (id)
);

-- Staff invites
create table if not exists staff_invites (
    id           bigint auto_increment primary key,
    token_hash   varchar(64)  not null unique,
    username     varchar(50)  null,
    email        varchar(120) not null,
    full_name    varchar(120) not null,
    invited_by   bigint       not null,
    expires_at   datetime(6)  not null,
    used         boolean      not null default false,
    accepted_at  datetime(6)  null,
    created_at   datetime(6)  not null,
    constraint fk_staff_invites_invited_by foreign key (invited_by) references users (id)
);

create table if not exists staff_invite_specialties (
    staff_invite_id bigint      not null,
    specialty       varchar(40) not null,
    constraint fk_staff_invite_specialties_invite foreign key (staff_invite_id) references staff_invites (id) on delete cascade
);

create unique index ux_staff_invite_specialties_invite_specialty on staff_invite_specialties (staff_invite_id, specialty);

-- Auth tokens
create table if not exists password_reset_tokens (
    id         bigint auto_increment primary key,
    token      varchar(64) not null unique,
    user_id    bigint      not null,
    expires_at datetime(6) not null,
    used       boolean     not null default false,
    created_at datetime(6) not null,
    constraint fk_password_reset_tokens_user foreign key (user_id) references users (id)
);

create table if not exists email_verification_tokens (
    id            bigint auto_increment primary key,
    user_id       bigint     not null,
    code          varchar(16) not null,
    expires_at    datetime(6) not null,
    used          boolean    not null default false,
    attempt_count int        not null default 0,
    created_at    datetime(6) not null,
    constraint fk_email_verification_tokens_user foreign key (user_id) references users (id)
);

create table if not exists auth_refresh_tokens (
    id                      bigint auto_increment primary key,
    user_id                 bigint       not null,
    token_hash              varchar(128) not null unique,
    token_family            varchar(80)  not null,
    expires_at              datetime(6)  not null,
    revoked_at              datetime(6)  null,
    rotated_at              datetime(6)  null,
    last_used_at            datetime(6)  null,
    replaced_by_token_hash  varchar(128) null,
    ip_address              varchar(64)  null,
    user_agent              varchar(255) null,
    created_at              datetime(6)  not null,
    constraint fk_auth_refresh_tokens_user foreign key (user_id) references users (id)
);

create index idx_auth_refresh_tokens_user_active on auth_refresh_tokens (user_id, revoked_at, expires_at);
create index idx_auth_refresh_tokens_family      on auth_refresh_tokens (token_family);

create table if not exists auth_mfa_challenges (
    id                 bigint auto_increment primary key,
    user_id            bigint      not null,
    challenge_id       varchar(64) not null unique,
    code_hash          varchar(64) not null,
    expires_at         datetime(6) not null,
    resend_available_at datetime(6) null,
    attempt_count      int         not null default 0,
    consumed           boolean     not null default false,
    created_at         datetime(6) not null,
    constraint fk_auth_mfa_challenges_user foreign key (user_id) references users (id)
);

create index idx_auth_mfa_challenges_user       on auth_mfa_challenges (user_id);
create index idx_auth_mfa_challenges_expires_at on auth_mfa_challenges (expires_at);

-- Email outbox
create table if not exists email_outbox (
    id              bigint auto_increment primary key,
    to_email        varchar(254) not null,
    subject         varchar(200) not null,
    plain_text_body text         not null,
    html_body       text         null,
    status          varchar(20)  not null,
    attempt_count   int          not null default 0,
    last_attempt_at datetime(6)  null,
    next_attempt_at datetime(6)  not null,
    sent_at         datetime(6)  null,
    last_error      varchar(500) null,
    created_at      datetime(6)  not null
);

-- Audit events
create table if not exists audit_events (
    id              bigint auto_increment primary key,
    actor_user_id   bigint       null,
    actor_username  varchar(80)  null,
    actor_role      varchar(20)  null,
    action          varchar(80)  not null,
    target_type     varchar(80)  null,
    target_id       varchar(120) null,
    ip_address      varchar(64)  null,
    user_agent      varchar(255) null,
    details_json    text         null,
    created_at      datetime(6)  not null,
    constraint fk_audit_events_actor foreign key (actor_user_id) references users (id)
);

create index idx_audit_events_action on audit_events (action, created_at);
create index idx_audit_events_actor  on audit_events (actor_user_id, created_at);

-- Pending registrations
create table if not exists pending_registrations (
    id                              bigint auto_increment primary key,
    username                        varchar(50)  not null unique,
    email                           varchar(120) not null unique,
    password_hash                   varchar(255) not null,
    full_name                       varchar(120) not null,
    verification_token_hash         varchar(64)  null unique,
    verification_token_expires_at   datetime(6)  null,
    last_verification_sent_at       datetime(6)  null,
    resend_available_at             datetime(6)  null,
    created_at                      datetime(6)  not null,
    updated_at                      datetime(6)  not null
);

-- Support requests
create table if not exists support_requests (
    id                  bigint auto_increment primary key,
    full_name           varchar(120) not null,
    email               varchar(160) not null,
    category            varchar(80)  not null,
    support_category_id bigint       null,
    subject             varchar(180) not null,
    message             text         not null,
    created_at          datetime(6)  not null,
    constraint fk_support_requests_support_category foreign key (support_category_id) references support_categories (id)
);

create index idx_support_requests_support_category_id on support_requests (support_category_id);

-- Scheduled broadcasts
create table if not exists scheduled_broadcasts (
    id               bigint auto_increment primary key,
    title            varchar(200)  not null,
    message          varchar(5000) not null,
    audience         varchar(20)   not null,
    scheduled_for    datetime(6)   not null,
    status           varchar(20)   not null,
    created_by_id    bigint        not null,
    recipient_count  int           not null default 0,
    sent_at          datetime(6)   null,
    created_at       datetime(6)   not null,
    constraint fk_scheduled_broadcasts_created_by foreign key (created_by_id) references users (id)
);

-- User preferences
create table if not exists user_preferences (
    id                                   bigint auto_increment primary key,
    user_id                              bigint      not null unique,
    theme                                varchar(20) not null default 'light',
    density                              varchar(20) not null default 'comfortable',
    timezone                             varchar(64) not null default 'Africa/Nairobi',
    language                             varchar(16) not null default 'en',
    reduce_motion                        boolean     not null default false,
    sidebar_collapsed_default            boolean     not null default false,
    default_landing_section              varchar(80) null,
    rows_per_page                        int         not null default 10,
    sticky_filters                       boolean     not null default true,
    remember_last_search                 boolean     not null default true,
    student_show_resolved_first          boolean     not null default false,
    maintenance_default_queue_sort       varchar(32) not null default 'urgency',
    maintenance_show_only_active_on_open boolean     not null default true,
    maintenance_highlight_sla_breaches   boolean     not null default true,
    admin_default_analytics_range        varchar(32) not null default 'Weekly',
    admin_default_ticket_scope           varchar(32) not null default 'all',
    admin_show_critical_first            boolean     not null default true,
    quiet_hours_enabled                  boolean     not null default false,
    quiet_hours_start                    time        null,
    quiet_hours_end                      time        null,
    created_at                           datetime(6) not null,
    updated_at                           datetime(6) not null,
    constraint fk_user_preferences_user foreign key (user_id) references users (id)
);

create table if not exists user_notification_preferences (
    id              bigint auto_increment primary key,
    user_id         bigint      not null,
    event_key       varchar(64) not null,
    in_app_enabled  boolean     not null default true,
    email_enabled   boolean     not null default false,
    delivery_mode   varchar(16) not null default 'instant',
    created_at      datetime(6) not null,
    updated_at      datetime(6) not null,
    constraint fk_user_notification_preferences_user  foreign key (user_id) references users (id),
    constraint uk_user_notification_preferences_event unique (user_id, event_key)
);

-- ============================================================
--  Seed: Service domains and default request types
-- ============================================================

insert into service_domains (domain_key, label, sort_order, created_at)
values
    ('ELECTRICAL', 'Electrical', 0, current_timestamp()),
    ('PLUMBING',   'Plumbing',   1, current_timestamp()),
    ('HVAC',       'HVAC',       2, current_timestamp()),
    ('CLEANING',   'Cleaning',   3, current_timestamp()),
    ('IT',         'IT',         4, current_timestamp()),
    ('FURNITURE',  'Furniture',  5, current_timestamp()),
    ('STRUCTURAL', 'Structural', 6, current_timestamp()),
    ('SAFETY',     'Safety',     7, current_timestamp()),
    ('OTHER',      'Other',      8, current_timestamp());

insert into request_types (service_domain_id, label, active, sort_order, created_at)
select sd.id,
       case sd.domain_key
           when 'HVAC' then 'HVAC issue'
           when 'IT'   then 'IT issue'
           when 'OTHER' then 'Other issue'
           else concat(sd.label, ' issue')
       end,
       true,
       0,
       current_timestamp()
from service_domains sd;

insert into support_categories (label, active, sort_order, created_at)
values
    ('Account Access',      true, 0, current_timestamp()),
    ('Ticket Submission',   true, 1, current_timestamp()),
    ('Status Updates',      true, 2, current_timestamp()),
    ('Notifications',       true, 3, current_timestamp()),
    ('Billing / Subscription', true, 4, current_timestamp()),
    ('Technical Bug',       true, 5, current_timestamp()),
    ('Feature Request',     true, 6, current_timestamp()),
    ('Other',               true, 7, current_timestamp());
