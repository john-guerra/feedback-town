-- Grant Postgres level permissions
grant select on town_config to anon, authenticated;
grant update on town_config to authenticated;

-- Set mode to YES_NO for testing
update town_config set active_mode = 'YES_NO' where id = 1;
