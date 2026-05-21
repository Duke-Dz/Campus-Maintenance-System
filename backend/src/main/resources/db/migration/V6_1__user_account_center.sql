set @sql = (
    select if(
        exists (
            select 1 from information_schema.columns
            where table_schema = database()
              and table_name = 'users'
              and column_name = 'department_name'
        ),
        'select 1',
        'alter table users add column department_name varchar(120) null'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @sql = (
    select if(
        exists (
            select 1 from information_schema.columns
            where table_schema = database()
              and table_name = 'users'
              and column_name = 'phone_extension'
        ),
        'select 1',
        'alter table users add column phone_extension varchar(40) null'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @sql = (
    select if(
        exists (
            select 1 from information_schema.columns
            where table_schema = database()
              and table_name = 'users'
              and column_name = 'primary_building_id'
        ),
        'select 1',
        'alter table users add column primary_building_id bigint null'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @sql = (
    select if(
        exists (
            select 1 from information_schema.columns
            where table_schema = database()
              and table_name = 'users'
              and column_name = 'avatar_type'
        ),
        'select 1',
        'alter table users add column avatar_type varchar(20) null'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @sql = (
    select if(
        exists (
            select 1 from information_schema.columns
            where table_schema = database()
              and table_name = 'users'
              and column_name = 'avatar_preset'
        ),
        'select 1',
        'alter table users add column avatar_preset varchar(40) null'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @sql = (
    select if(
        exists (
            select 1 from information_schema.columns
            where table_schema = database()
              and table_name = 'users'
              and column_name = 'avatar_image_path'
        ),
        'select 1',
        'alter table users add column avatar_image_path varchar(255) null'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @sql = (
    select if(
        exists (
            select 1 from information_schema.table_constraints
            where constraint_schema = database()
              and table_name = 'users'
              and constraint_name = 'fk_users_primary_building'
        ),
        'select 1',
        'alter table users add constraint fk_users_primary_building foreign key (primary_building_id) references buildings (id)'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @sql = (
    select if(
        exists (
            select 1 from information_schema.statistics
            where table_schema = database()
              and table_name = 'users'
              and index_name = 'idx_users_primary_building'
        ),
        'select 1',
        'create index idx_users_primary_building on users (primary_building_id)'
    )
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

create table if not exists user_preferences (
    id bigint auto_increment primary key,
    user_id bigint not null unique,
    theme varchar(20) not null default 'light',
    density varchar(20) not null default 'comfortable',
    timezone varchar(64) not null default 'Africa/Nairobi',
    language varchar(16) not null default 'en',
    reduce_motion boolean not null default false,
    sidebar_collapsed_default boolean not null default false,
    default_landing_section varchar(80) null,
    rows_per_page int not null default 10,
    sticky_filters boolean not null default true,
    remember_last_search boolean not null default true,
    student_show_resolved_first boolean not null default false,
    maintenance_default_queue_sort varchar(32) not null default 'urgency',
    maintenance_show_only_active_on_open boolean not null default true,
    maintenance_highlight_sla_breaches boolean not null default true,
    admin_default_analytics_range varchar(32) not null default 'Weekly',
    admin_default_ticket_scope varchar(32) not null default 'all',
    admin_show_critical_first boolean not null default true,
    quiet_hours_enabled boolean not null default false,
    quiet_hours_start time null,
    quiet_hours_end time null,
    created_at datetime(6) not null,
    updated_at datetime(6) not null,
    constraint fk_user_preferences_user foreign key (user_id) references users (id)
);

create table if not exists user_notification_preferences (
    id bigint auto_increment primary key,
    user_id bigint not null,
    event_key varchar(64) not null,
    in_app_enabled boolean not null default true,
    email_enabled boolean not null default false,
    delivery_mode varchar(16) not null default 'instant',
    created_at datetime(6) not null,
    updated_at datetime(6) not null,
    constraint fk_user_notification_preferences_user foreign key (user_id) references users (id),
    constraint uk_user_notification_preferences_event unique (user_id, event_key)
);

insert into user_preferences (
    user_id,
    theme,
    density,
    timezone,
    language,
    reduce_motion,
    sidebar_collapsed_default,
    rows_per_page,
    sticky_filters,
    remember_last_search,
    student_show_resolved_first,
    maintenance_default_queue_sort,
    maintenance_show_only_active_on_open,
    maintenance_highlight_sla_breaches,
    admin_default_analytics_range,
    admin_default_ticket_scope,
    admin_show_critical_first,
    quiet_hours_enabled,
    created_at,
    updated_at
)
select
    u.id,
    'light',
    'comfortable',
    'Africa/Nairobi',
    'en',
    false,
    false,
    10,
    true,
    true,
    false,
    'urgency',
    true,
    true,
    'Weekly',
    'all',
    true,
    false,
    current_timestamp(),
    current_timestamp()
from users u
where not exists (
    select 1
    from user_preferences up
    where up.user_id = u.id
);
