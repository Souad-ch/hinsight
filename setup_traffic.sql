-- ════════════════════════════════════════════════════════════════
--  Hanadi Insights — تفعيل عدّاد الزيارات (ترافيك الموقع)
--  يُنشئ جدول الزيارات + حماية RLS (الزائر يسجّل فقط، الأدمن يقرأ).
--  شغّليه مرة واحدة في Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════

create table if not exists page_views (
  id         bigserial primary key,
  path       text,
  created_at timestamptz default now()
);

-- فهرس على التاريخ لتسريع عدّ اليوم/الشهر
create index if not exists page_views_created_idx on page_views (created_at);

-- حماية: الزائر يضيف زيارة فقط (لا قراءة)، الأدمن يقرأ الكل
alter table page_views enable row level security;

drop policy if exists "anon insert views" on page_views;
create policy "anon insert views" on page_views
  for insert to anon with check (true);

drop policy if exists "admin read views" on page_views;
create policy "admin read views" on page_views
  for select to authenticated using (true);

-- ════════════════════════════════════════════════════════════════
--  خلصتِ ✓  من الآن تُحتسب كل زيارة، وتظهر الأرقام في
--            لوحة التحكم → الإحصائيات.
-- ════════════════════════════════════════════════════════════════
