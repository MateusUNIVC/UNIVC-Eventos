create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  subtitle text,
  description text,
  event_type text,
  event_date date not null,
  start_time time not null,
  end_time time,
  location text not null,
  registration_open boolean not null default true,
  attendance_open boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists events_slug_lower_uq on public.events (lower(slug));

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  is_univc_student boolean not null,
  course text,
  custom_course text,
  period text,
  custom_period text,
  registered_at timestamptz not null default now()
);
create unique index if not exists registrations_event_email_lower_uq on public.registrations (event_id, lower(email));

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete set null,
  full_name text not null,
  email text not null,
  is_univc_student boolean not null,
  course text,
  custom_course text,
  period text,
  custom_period text,
  checked_in_at timestamptz not null default now()
);
create unique index if not exists attendance_event_email_lower_uq on public.attendance (event_id, lower(email));

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Administrador UNIVC',
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at before update on public.events for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_profiles where user_id = auth.uid());
$$;

alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.attendance enable row level security;
alter table public.admin_profiles enable row level security;

create policy "admins read events" on public.events for select to authenticated using (public.is_admin());
create policy "admins insert events" on public.events for insert to authenticated with check (public.is_admin());
create policy "admins update events" on public.events for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete events" on public.events for delete to authenticated using (public.is_admin());

create policy "admins read registrations" on public.registrations for select to authenticated using (public.is_admin());
create policy "admins read attendance" on public.attendance for select to authenticated using (public.is_admin());
create policy "admins read profiles" on public.admin_profiles for select to authenticated using (user_id = auth.uid());

create or replace function public.get_public_event(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_event public.events;
begin
  select * into v_event from public.events where lower(slug)=lower(trim(p_slug)) limit 1;
  if v_event.id is null then return null; end if;
  return jsonb_build_object(
    'id', v_event.id,
    'name', v_event.name,
    'slug', v_event.slug,
    'subtitle', v_event.subtitle,
    'description', v_event.description,
    'event_type', v_event.event_type,
    'event_date', v_event.event_date,
    'start_time', v_event.start_time,
    'end_time', v_event.end_time,
    'location', v_event.location,
    'registration_open', v_event.registration_open,
    'attendance_open', v_event.attendance_open
  );
end;
$$;

grant execute on function public.get_public_event(text) to anon, authenticated;

create or replace function public.register_for_event(
  p_event_slug text,
  p_full_name text,
  p_email text,
  p_is_univc_student boolean,
  p_course text default null,
  p_custom_course text default null,
  p_period text default null,
  p_custom_period text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
  v_email text := lower(trim(p_email));
  v_id uuid;
begin
  select * into v_event from public.events where lower(slug)=lower(trim(p_event_slug)) limit 1;
  if v_event.id is null then return jsonb_build_object('ok',false,'code','not_found'); end if;
  if not v_event.registration_open then return jsonb_build_object('ok',false,'code','closed'); end if;
  if length(trim(coalesce(p_full_name,''))) < 3 or position('@' in v_email) = 0 then return jsonb_build_object('ok',false,'code','validation','message','Dados inválidos.'); end if;
  if p_is_univc_student and (coalesce(trim(p_course),'')='' or coalesce(trim(p_period),'')='') then return jsonb_build_object('ok',false,'code','validation','message','Curso e período são obrigatórios.'); end if;
  if exists(select 1 from public.registrations where event_id=v_event.id and lower(email)=v_email) then return jsonb_build_object('ok',false,'code','duplicate'); end if;

  insert into public.registrations(event_id,full_name,email,is_univc_student,course,custom_course,period,custom_period)
  values(v_event.id,trim(p_full_name),v_email,p_is_univc_student,
    case when p_is_univc_student then nullif(trim(p_course),'') else null end,
    case when p_is_univc_student then nullif(trim(p_custom_course),'') else null end,
    case when p_is_univc_student then nullif(trim(p_period),'') else null end,
    case when p_is_univc_student then nullif(trim(p_custom_period),'') else null end)
  returning id into v_id;
  return jsonb_build_object('ok',true,'id',v_id);
exception when unique_violation then
  return jsonb_build_object('ok',false,'code','duplicate');
end;
$$;

grant execute on function public.register_for_event(text,text,text,boolean,text,text,text,text) to anon, authenticated;

create or replace function public.confirm_event_attendance(
  p_event_slug text,
  p_full_name text,
  p_email text,
  p_is_univc_student boolean,
  p_course text default null,
  p_custom_course text default null,
  p_period text default null,
  p_custom_period text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
  v_email text := lower(trim(p_email));
  v_registration_id uuid;
  v_existing public.attendance;
  v_checked timestamptz;
begin
  select * into v_event from public.events where lower(slug)=lower(trim(p_event_slug)) limit 1;
  if v_event.id is null then return jsonb_build_object('ok',false,'code','not_found'); end if;
  if not v_event.attendance_open then return jsonb_build_object('ok',false,'code','closed'); end if;
  if length(trim(coalesce(p_full_name,''))) < 3 or position('@' in v_email)=0 then return jsonb_build_object('ok',false,'code','validation','message','Dados inválidos.'); end if;
  if p_is_univc_student and (coalesce(trim(p_course),'')='' or coalesce(trim(p_period),'')='') then return jsonb_build_object('ok',false,'code','validation','message','Curso e período são obrigatórios.'); end if;

  select * into v_existing from public.attendance where event_id=v_event.id and lower(email)=v_email limit 1;
  if v_existing.id is not null then
    return jsonb_build_object('ok',false,'code','duplicate','full_name',v_existing.full_name,'checked_in_at',v_existing.checked_in_at);
  end if;

  select id into v_registration_id from public.registrations where event_id=v_event.id and lower(email)=v_email limit 1;

  insert into public.attendance(event_id,registration_id,full_name,email,is_univc_student,course,custom_course,period,custom_period)
  values(v_event.id,v_registration_id,trim(p_full_name),v_email,p_is_univc_student,
    case when p_is_univc_student then nullif(trim(p_course),'') else null end,
    case when p_is_univc_student then nullif(trim(p_custom_course),'') else null end,
    case when p_is_univc_student then nullif(trim(p_period),'') else null end,
    case when p_is_univc_student then nullif(trim(p_custom_period),'') else null end)
  returning checked_in_at into v_checked;
  return jsonb_build_object('ok',true,'checked_in_at',v_checked,'registration_matched',v_registration_id is not null);
exception when unique_violation then
  select * into v_existing from public.attendance where event_id=v_event.id and lower(email)=v_email limit 1;
  return jsonb_build_object('ok',false,'code','duplicate','full_name',v_existing.full_name,'checked_in_at',v_existing.checked_in_at);
end;
$$;

grant execute on function public.confirm_event_attendance(text,text,text,boolean,text,text,text,text) to anon, authenticated;

revoke all on table public.registrations from anon;
revoke all on table public.attendance from anon;
revoke all on table public.admin_profiles from anon;
