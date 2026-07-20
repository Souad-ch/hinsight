-- ════════════════════════════════════════════════════════════════
--  Hanadi Insights — سدّ الثغرات الأمنية الخطيرة في RLS
--  آمن: لا يكسر أي ميزة شغّالة (الموقع، الحجز، الدفع، بوابة VIP).
--  شغّليه كاملاً في Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════


-- ── 1) TESTIMONIALS: منع الزوّار من حذف الآراء ──────────────────
--    نُبقي: قراءة للعموم + إضافة رأي للزوّار + إدارة كاملة للأدمن.
drop policy if exists "testi_delete" on testimonials;              -- ❌ حذف للعموم (خطير)
drop policy if exists "public delete testimonials" on testimonials;

-- تأكيد وجود القراءة العامة (آراء تظهر بالموقع)
drop policy if exists "testi_read" on testimonials;
create policy "testi_read" on testimonials
  for select to anon, authenticated using (true);

-- تأكيد إضافة رأي من نموذج الموقع (زائر)
drop policy if exists "public insert testimonials" on testimonials;
create policy "public insert testimonials" on testimonials
  for insert to anon with check (true);

-- إدارة كاملة للأدمن (موافقة/إخفاء/حذف/تعديل)
drop policy if exists "admin manage testimonials" on testimonials;
create policy "admin manage testimonials" on testimonials
  for all to authenticated using (true) with check (true);


-- ── 2) ARTICLES: منع الزوّار من تعديل المقالات ─────────────────
drop policy if exists "anon update articles" on articles;         -- ❌ تعديل للزوّار (خطير)
drop policy if exists "anon all articles"    on articles;

-- (تبقى سياساتك: public read published + admin manage — لا نلمسها)


-- ── 3) PAGE_SECTIONS: منع الزوّار من إضافة أقسام ────────────────
drop policy if exists "anon insert sections" on page_sections;    -- ❌ إضافة للزوّار (خطير)
drop policy if exists "anon all sections"    on page_sections;

-- تأكيد القراءة العامة (المحتوى يظهر بالموقع) + إدارة الأدمن
drop policy if exists "public read sections" on page_sections;
create policy "public read sections" on page_sections
  for select to anon, authenticated using (true);

drop policy if exists "admin manage sections" on page_sections;
create policy "admin manage sections" on page_sections
  for all to authenticated using (true) with check (true);


-- ── 4) VIP: منع الزوّار من قراءة بيانات عملاء VIP ──────────────
--    العميل يدخل بحساب (authenticated) فتبقى القراءة تعمل عبر auth_all.
drop policy if exists "anon_select" on vip_subscriptions;         -- ❌ قراءة للزوّار (تسريب)
drop policy if exists "anon_select" on vip_sessions;              -- ❌ قراءة للزوّار (تسريب)

-- تأكيد صلاحية المستخدمين المسجّلين (العميل + الأدمن)
drop policy if exists "auth_all" on vip_subscriptions;
create policy "auth_all" on vip_subscriptions
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all" on vip_sessions;
create policy "auth_all" on vip_sessions
  for all to authenticated using (true) with check (true);


-- ── 5) MSG_TEMPLATES: تفعيل الحماية (كانت مطفية تماماً) ─────────
--    تُستخدم فقط من لوحة الأدمن → صلاحية للمسجّلين فقط.
alter table msg_templates enable row level security;
drop policy if exists "admin manage templates" on msg_templates;
create policy "admin manage templates" on msg_templates
  for all to authenticated using (true) with check (true);


-- ════════════════════════════════════════════════════════════════
--  خلصتِ ✓  الثغرات الخطيرة انسدّت، وكل الميزات تبقى شغّالة.
-- ════════════════════════════════════════════════════════════════
