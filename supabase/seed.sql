insert into public.events (
  name, slug, subtitle, description, event_type, event_date, start_time, end_time, location, registration_open, attendance_open
)
select
  'Saúde, Cultura e Cidadania',
  'saude-cultura-cidadania',
  'Um recorte das comunidades quilombolas',
  'Encontro acadêmico-cultural do UNIVC.',
  'Encontro Acadêmico-Cultural',
  '2026-09-25'::date,
  '19:00'::time,
  null,
  'Auditório Principal — UNIVC',
  true,
  false
where not exists (
  select 1 from public.events where lower(slug) = 'saude-cultura-cidadania'
);
