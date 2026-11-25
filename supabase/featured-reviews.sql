do $$
begin
  if to_regclass('public.orders') is null then
    raise exception 'La tabla public.orders no existe. Ejecuta primero supabase/orders-table.sql.';
  end if;
end;
$$;

create table if not exists public.plant_reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id bigint not null references public.plantas(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 15 and 500),
  created_at timestamptz not null default now(),
  unique (user_id, plant_id)
);

create index if not exists plant_reviews_created_at_idx
  on public.plant_reviews (created_at desc);

alter table public.plant_reviews enable row level security;
revoke all on public.plant_reviews from anon, authenticated;
grant select (id, plant_id, display_name, rating, comment, created_at)
  on public.plant_reviews to anon, authenticated;

drop policy if exists "read plant reviews" on public.plant_reviews;
create policy "read plant reviews" on public.plant_reviews
  for select to anon, authenticated using (true);
