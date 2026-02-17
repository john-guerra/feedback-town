-- Create the configuration table
create table if not exists town_config (
  id int primary key default 1,
  active_mode text not null default 'IDLE', -- 'IDLE', 'YES_NO', 'ABCD'
  active_question text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure we have a singleton row
insert into town_config (id, active_mode)
values (1, 'IDLE')
on conflict (id) do nothing;

-- Enable Realtime for this table
alter publication supabase_realtime add table town_config;

-- Policy: Allow read access to everyone
alter table town_config enable row level security;

create policy "Enable read access for all users"
on town_config for select
using (true);

-- Policy: Allow update only to authenticated users (Teachers)
-- Assuming teachers are authenticated via Supabase Auth
create policy "Enable update for teachers"
on town_config for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
