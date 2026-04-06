alter table users
    add column mfa_enabled boolean not null default false;

create table if not exists auth_mfa_challenges (
    id bigint auto_increment primary key,
    user_id bigint not null,
    challenge_id varchar(64) not null unique,
    code_hash varchar(64) not null,
    expires_at datetime(6) not null,
    resend_available_at datetime(6) null,
    attempt_count int not null default 0,
    consumed boolean not null default false,
    created_at datetime(6) not null,
    constraint fk_auth_mfa_challenges_user foreign key (user_id) references users (id)
);

create index idx_auth_mfa_challenges_user on auth_mfa_challenges (user_id);
create index idx_auth_mfa_challenges_expires_at on auth_mfa_challenges (expires_at);
