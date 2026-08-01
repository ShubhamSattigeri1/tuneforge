-- Add user_blends table for Genre Blender saved combos
create table if not exists public.user_blends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  genre text,
  mood text,
  instruments text[],
  production text,
  blend_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_blends_user_id on public.user_blends(user_id);
