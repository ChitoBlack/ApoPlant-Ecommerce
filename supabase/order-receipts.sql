alter table public.orders
  add column if not exists receipt_email_status text not null default 'pending'
    check (receipt_email_status in ('pending', 'sending', 'sent', 'failed')),
  add column if not exists receipt_email_attempted_at timestamptz;

create or replace function public.claim_order_receipt_email(p_order_id uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  with claimed as (
    update public.orders
    set receipt_email_status = 'sending',
        receipt_email_attempted_at = now()
    where id = p_order_id
      and payment_status = 'approved'
      and (
        receipt_email_status in ('pending', 'failed')
        or (
          receipt_email_status = 'sending'
          and receipt_email_attempted_at < now() - interval '10 minutes'
        )
      )
    returning id
  )
  select exists(select 1 from claimed);
$$;

revoke all on function public.claim_order_receipt_email(uuid) from public, anon, authenticated;
grant execute on function public.claim_order_receipt_email(uuid) to service_role;
