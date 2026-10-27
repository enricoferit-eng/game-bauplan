-- Game-Bauplan: Online speichern & teilen
-- Einmal im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Legt nur eigene Tabellen/Funktionen mit dem Präfix gb_ an und verändert nichts anderes.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.gb_plans (
  id          text primary key check (id ~ '^[A-Za-z0-9]{10}$'),
  secret_hash text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Kein direkter Zugriff auf die Tabelle: nur über die beiden Funktionen unten.
alter table public.gb_plans enable row level security;
revoke all on public.gb_plans from anon, authenticated;

-- Speichern: legt einen Bauplan an oder aktualisiert ihn, wenn das Geheimnis passt.
create or replace function public.gb_save(p_id text, p_secret text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  h text;
begin
  if p_id !~ '^[A-Za-z0-9]{10}$' or length(coalesce(p_secret, '')) < 24 or pg_column_size(p_data) > 300000 then
    raise exception 'ungueltige Daten';
  end if;
  h := encode(extensions.digest(p_secret, 'sha256'), 'hex');
  insert into public.gb_plans (id, secret_hash, data)
  values (p_id, h, p_data)
  on conflict (id) do update
    set data = excluded.data, updated_at = now()
    where public.gb_plans.secret_hash = h;
  return found;
end;
$$;

-- Laden: jeder mit dem Link kann einen Bauplan lesen (aber nicht auflisten).
create or replace function public.gb_load(p_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select data from public.gb_plans where id = p_id;
$$;

revoke all on function public.gb_save(text, text, jsonb) from public;
revoke all on function public.gb_load(text) from public;
grant execute on function public.gb_save(text, text, jsonb) to anon, authenticated;
grant execute on function public.gb_load(text) to anon, authenticated;
