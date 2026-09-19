create table if not exists red_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table red_lines enable row level security;

create policy "red_lines_select_own" on red_lines
  for select using (auth.uid() = user_id);

create policy "red_lines_insert_own" on red_lines
  for insert with check (auth.uid() = user_id);

create policy "red_lines_update_own" on red_lines
  for update using (auth.uid() = user_id);

create policy "red_lines_delete_own" on red_lines
  for delete using (auth.uid() = user_id);
