-- Game-Bauplan: Konten & Projekte
-- Einmal im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Jede:r Angemeldete sieht und ändert nur die eigenen Projekte.

create table if not exists public.gb_projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null default 'Neues Spiel' check (length(title) <= 120),
  progress   int  not null default 0,
  data       jsonb not null check (pg_column_size(data) < 400000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gb_projects_user_idx on public.gb_projects (user_id, updated_at desc);

alter table public.gb_projects enable row level security;
revoke all on public.gb_projects from anon;
grant select, insert, update, delete on public.gb_projects to authenticated;

drop policy if exists "gb_projects_own" on public.gb_projects;
create policy "gb_projects_own" on public.gb_projects for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
