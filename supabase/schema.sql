create extension if not exists "pgcrypto";

create table if not exists public.services (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	description text,
	duration_minutes integer not null check (duration_minutes > 0),
	price_cents integer not null check (price_cents >= 0),
	active boolean not null default true,
	created_at timestamptz not null default now()
);

create table if not exists public.bookings (
	id uuid primary key default gen_random_uuid(),
	service_id uuid not null references public.services(id),
	customer_name text not null,
	customer_email text not null,
	customer_phone text not null,
	notes text,
	starts_at timestamptz not null,
	ends_at timestamptz not null,
	status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
	google_calendar_event_id text,
	created_at timestamptz not null default now()
);

create index if not exists bookings_starts_at_idx on public.bookings(starts_at);
create index if not exists bookings_status_idx on public.bookings(status);

alter table public.services enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Public read services" on public.services;
create policy "Public read services"
on public.services
for select
using (active = true);

drop policy if exists "Service role full services" on public.services;
create policy "Service role full services"
on public.services
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "Service role full bookings" on public.bookings;
create policy "Service role full bookings"
on public.bookings
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

with seed(name, description, duration_minutes, price_cents, active) as (
	values
		('Kids Haircut or Fade', 'Kids under 18 regular haircut or fade.', 45, 2500, true),
		('Men''s Regular Haircut', 'Men''s regular haircut / corte clasico.', 45, 2500, true),
		('Men Fade', 'Fade / degradado with blend and finish.', 60, 3000, true),
		('Beard', 'Beard / barba clean-up add-on.', 15, 500, true)
)
update public.services s
set
	description = seed.description,
	duration_minutes = seed.duration_minutes,
	price_cents = seed.price_cents,
	active = seed.active
from seed
where lower(s.name) = lower(seed.name);

insert into public.services (name, description, duration_minutes, price_cents, active)
select seed.name, seed.description, seed.duration_minutes, seed.price_cents, seed.active
from (
	values
		('Kids Haircut or Fade', 'Kids under 18 regular haircut or fade.', 45, 2500, true),
		('Men''s Regular Haircut', 'Men''s regular haircut / corte clasico.', 45, 2500, true),
		('Men Fade', 'Fade / degradado with blend and finish.', 60, 3000, true),
		('Beard', 'Beard / barba clean-up add-on.', 15, 500, true)
) as seed(name, description, duration_minutes, price_cents, active)
where not exists (
	select 1
	from public.services s
	where lower(s.name) = lower(seed.name)
);

update public.services
set active = false
where name in ('Signature Haircut', 'Skin Fade', 'Haircut + Beard', 'Cut + Beard Sculpt');