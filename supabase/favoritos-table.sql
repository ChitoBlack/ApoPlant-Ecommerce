-- Crea la tabla de favoritos que usa la app
-- Ejecuta esto en Supabase SQL Editor (en el proyecto correcto)

create table if not exists public.favoritos (
  user_id uuid not null references auth.users(id),
  planta_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, planta_id)
);

alter table public.favoritos enable row level security;

drop policy if exists "select_favoritos" on public.favoritos;
create policy "select_favoritos" on public.favoritos
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "insert_favoritos" on public.favoritos;
create policy "insert_favoritos" on public.favoritos
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "delete_favoritos" on public.favoritos;
create policy "delete_favoritos" on public.favoritos
  for delete to authenticated using (auth.uid() = user_id);
