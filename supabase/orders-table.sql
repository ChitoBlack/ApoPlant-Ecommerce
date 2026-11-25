create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  customer_email text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  total_amount bigint not null check (total_amount > 0),
  currency text not null default 'CLP' check (currency = 'CLP'),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  fulfillment_status text not null default 'pending'
    check (fulfillment_status in ('pending', 'preparing', 'shipped', 'delivered', 'cancelled')),
  stock_committed boolean not null default false,
  stock_issue boolean not null default false,
  mp_preference_id text unique,
  mp_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

create or replace function public.commit_order_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders%rowtype;
  item jsonb;
begin
  select * into order_row
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if order_row.stock_committed then
    return true;
  end if;

  for item in select value from jsonb_array_elements(order_row.items)
  loop
    update public.plantas
    set stock = stock - (item->>'cantidad')::integer
    where id = (item->>'id')::bigint
      and stock >= (item->>'cantidad')::integer;

    if not found then
      raise exception 'Insufficient stock for product %', item->>'id';
    end if;
  end loop;

  update public.orders
  set stock_committed = true,
      stock_issue = false,
      updated_at = now()
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.commit_order_stock(uuid) from public, anon, authenticated;
grant execute on function public.commit_order_stock(uuid) to service_role;
