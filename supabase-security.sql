-- ════════════════════════════════════════════════════════════════
--  Hanadi Insights — حماية قاعدة البيانات (RLS صارم)
--  الزوار: يقرأون المنشور فقط + يضيفون حجز/اشتراك فقط.
--  الأدمن (مسجّل دخول): كل الصلاحيات.
-- ════════════════════════════════════════════════════════════════
--
--  ⚠️ شغّلي هذا الملف كاملاً في Supabase → SQL Editor → Run.
--     بعدها كل عمليات الإدارة تتطلب تسجيل دخول حقيقي.
-- ════════════════════════════════════════════════════════════════


-- ── تفعيل RLS على كل الجداول ─────────────────────────────────────
alter table articles               enable row level security;
alter table bookings               enable row level security;
alter table testimonials           enable row level security;
alter table site_settings          enable row level security;
alter table page_sections          enable row level security;
alter table newsletter_subscribers enable row level security;


-- ════════════════════════════════════════════════════════════════
--  ARTICLES — الزوار يقرأون المنشور فقط؛ الأدمن يدير الكل
-- ════════════════════════════════════════════════════════════════
drop policy if exists "public read published articles" on articles;
drop policy if exists "anon all articles"              on articles;
drop policy if exists "admin manage articles"          on articles;

create policy "public read published articles" on articles
  for select to anon using (published = true);

create policy "admin manage articles" on articles
  for all to authenticated using (true) with check (true);


-- ════════════════════════════════════════════════════════════════
--  TESTIMONIALS — الزوار يقرأون الكل؛ الأدمن يدير
-- ════════════════════════════════════════════════════════════════
drop policy if exists "public read testimonials" on testimonials;
drop policy if exists "anon all testimonials"    on testimonials;
drop policy if exists "admin manage testimonials" on testimonials;

create policy "public read testimonials" on testimonials
  for select to anon using (true);

create policy "admin manage testimonials" on testimonials
  for all to authenticated using (true) with check (true);


-- ════════════════════════════════════════════════════════════════
--  PAGE_SECTIONS — الزوار يقرأون؛ الأدمن يدير
-- ════════════════════════════════════════════════════════════════
drop policy if exists "public read sections"  on page_sections;
drop policy if exists "anon all sections"     on page_sections;
drop policy if exists "admin manage sections" on page_sections;

create policy "public read sections" on page_sections
  for select to anon using (true);

create policy "admin manage sections" on page_sections
  for all to authenticated using (true) with check (true);


-- ════════════════════════════════════════════════════════════════
--  SITE_SETTINGS — الزوار يقرأون (للثيم)؛ الأدمن يعدّل
-- ════════════════════════════════════════════════════════════════
drop policy if exists "public read settings"  on site_settings;
drop policy if exists "anon all settings"     on site_settings;
drop policy if exists "admin manage settings" on site_settings;

create policy "public read settings" on site_settings
  for select to anon using (true);

create policy "admin manage settings" on site_settings
  for all to authenticated using (true) with check (true);


-- ════════════════════════════════════════════════════════════════
--  BOOKINGS — الزوار يضيفون فقط (لا قراءة!)؛ الأدمن يرى ويدير
-- ════════════════════════════════════════════════════════════════
drop policy if exists "public read bookings"   on bookings;
drop policy if exists "anon all bookings"      on bookings;
drop policy if exists "public insert bookings" on bookings;
drop policy if exists "admin manage bookings"  on bookings;

create policy "public insert bookings" on bookings
  for insert to anon with check (true);

create policy "admin manage bookings" on bookings
  for all to authenticated using (true) with check (true);


-- ════════════════════════════════════════════════════════════════
--  NEWSLETTER — الزوار يشتركون فقط (لا قراءة!)؛ الأدمن يرى
-- ════════════════════════════════════════════════════════════════
drop policy if exists "public read subscribers"   on newsletter_subscribers;
drop policy if exists "anon all subscribers"      on newsletter_subscribers;
drop policy if exists "public insert subscribers" on newsletter_subscribers;
drop policy if exists "admin manage subscribers"  on newsletter_subscribers;

create policy "public insert subscribers" on newsletter_subscribers
  for insert to anon with check (true);

create policy "admin manage subscribers" on newsletter_subscribers
  for all to authenticated using (true) with check (true);


-- ════════════════════════════════════════════════════════════════
--  خلصتِ ✓
--  الآن: لا أحد يقدر يقرأ الحجوزات أو المشتركين، ولا يحذف/يعدّل
--  أي محتوى، إلا إذا كان مسجّل دخول كأدمن.
-- ════════════════════════════════════════════════════════════════
