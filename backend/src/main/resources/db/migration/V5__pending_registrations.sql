create table if not exists pending_registrations (
    id bigint auto_increment primary key,
    username varchar(50) not null unique,
    email varchar(120) not null unique,
    password_hash varchar(255) not null,
    full_name varchar(120) not null,
    verification_token_hash varchar(64) null unique,
    verification_token_expires_at datetime(6) null,
    last_verification_sent_at datetime(6) null,
    resend_available_at datetime(6) null,
    created_at datetime(6) not null,
    updated_at datetime(6) not null
);

insert into pending_registrations (
    username,
    email,
    password_hash,
    full_name,
    verification_token_hash,
    verification_token_expires_at,
    last_verification_sent_at,
    resend_available_at,
    created_at,
    updated_at
)
select
    u.username,
    lower(u.email),
    u.password_hash,
    u.full_name,
    null,
    null,
    null,
    null,
    u.created_at,
    u.created_at
from users u
where u.email_verified = false
  and not exists (
      select 1
      from pending_registrations p
      where lower(p.email) = lower(u.email)
         or lower(p.username) = lower(u.username)
  );

delete from email_verification_tokens
where user_id in (
    select id
    from users
    where email_verified = false
);

delete from password_reset_tokens
where user_id in (
    select id
    from users
    where email_verified = false
);

delete from auth_refresh_tokens
where user_id in (
    select id
    from users
    where email_verified = false
);

update audit_events
set actor_user_id = null
where actor_user_id in (
    select id
    from users
    where email_verified = false
);

delete from users
where email_verified = false;
