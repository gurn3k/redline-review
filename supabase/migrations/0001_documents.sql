create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  extracted_text text not null,
  analysis_result jsonb,
  created_at timestamptz not null default now()
);

alter table documents enable row level security;

create policy "documents_select_own" on documents
  for select using (auth.uid() = user_id);

create policy "documents_insert_own" on documents
  for insert with check (auth.uid() = user_id);

create policy "documents_update_own" on documents
  for update using (auth.uid() = user_id);

create policy "documents_delete_own" on documents
  for delete using (auth.uid() = user_id);
