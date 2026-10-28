-- Nordlicht: Tageslimit für KI-Anfragen
-- Einmal im Supabase-Dashboard unter "SQL Editor" ausführen.

create table if not exists public.gb_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  calls   int  not null default 0,
  primary key (user_id, day)
);
alter table public.gb_ai_usage enable row level security;
revoke all on public.gb_ai_usage from anon, authenticated;

-- Zählt eine Anfrage und sagt, ob sie noch erlaubt ist. Nur die Server-Funktion darf das aufrufen.
create or replace function public.gb_ai_hit(p_user uuid, p_limit int)
returns boolean
language sql
security definer
set search_path = public
as $$
  insert into public.gb_ai_usage as u (user_id, day, calls) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set calls = u.calls + 1
  returning calls <= p_limit;
$$;
revoke all on function public.gb_ai_hit(uuid, int) from public, anon, authenticated;
grant execute on function public.gb_ai_hit(uuid, int) to service_role;
