create extension if not exists pgcrypto;

create table if not exists public.trail_sessions (
  session_id uuid primary key default gen_random_uuid(),
  current_milestone text not null default 'starting_outpost',
  resources jsonb not null default '{"budget": 100, "morale": 76, "techDebt": 18}'::jsonb,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_trail_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trail_sessions_updated_at on public.trail_sessions;

create trigger trail_sessions_updated_at
before update on public.trail_sessions
for each row
execute function public.set_trail_sessions_updated_at();

alter table public.trail_sessions enable row level security;

drop policy if exists "trail_sessions_no_public_access" on public.trail_sessions;

create policy "trail_sessions_no_public_access"
on public.trail_sessions
for all
using (false)
with check (false);
