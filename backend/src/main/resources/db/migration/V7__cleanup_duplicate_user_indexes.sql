-- Remove redundant users(primary_building_id) index created during partial/legacy runs.
-- Keep at least one supporting index for the FK and only drop the explicit duplicate when safe.
set @candidate_count = (
    select count(*)
    from (
        select s.index_name
        from information_schema.statistics s
        where s.table_schema = database()
          and s.table_name = 'users'
          and s.non_unique = 1
          and s.index_name <> 'PRIMARY'
        group by s.index_name
        having count(*) = 1
           and max(case when s.column_name = 'primary_building_id' then 1 else 0 end) = 1
    ) x
);

set @has_target_index = (
    select if(
        exists (
            select 1
            from information_schema.statistics
            where table_schema = database()
              and table_name = 'users'
              and index_name = 'idx_users_primary_building'
        ),
        1,
        0
    )
);

set @sql = (
    select if(
        @candidate_count > 1 and @has_target_index = 1,
        'drop index idx_users_primary_building on users',
        'select 1'
    )
);

prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;
