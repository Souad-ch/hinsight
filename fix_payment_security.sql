-- ════════════════════════════════════════════════════════════════
--  Hanadi Insights — إغلاق ثغرة الدفع
--  المشكلة: الزائر يقدر يعلّم حجزه "مؤكّد" (confirmed) من المتصفح
--           بدون دفع حقيقي.
--  الحل:   الزائر يقدر يحدّث حجزه لحالات عادية فقط (قيد الانتظار /
--           بانتظار الدفع)، أمّا "مؤكّد" فيصير حصراً من السيرفر
--           (دالة verify-usdt التي تفحص البلوكتشين فعلياً).
--
--  آمن: التأكيد التلقائي يبقى شغّال — الكرون يفحص كل دقيقة،
--       وصفحة الدفع تراقب كل 12 ثانية وتُظهر النجاح تلقائياً.
--       المسار اليدوي (تعليم الحجز "قيد الانتظار") يبقى شغّال أيضاً.
--
--  شغّليه كاملاً في Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════


-- 1) احذفي أي سياسة تحديث حالية تسمح للزائر بتعديل الحجوزات
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public'
      and tablename  = 'bookings'
      and cmd        = 'UPDATE'
      and 'anon' = any(roles)
  loop
    execute format('drop policy if exists %I on bookings', r.policyname);
  end loop;
end $$;

-- تنظيف أسماء شائعة احتياطاً
drop policy if exists "update bookings"        on bookings;
drop policy if exists "anon update bookings"   on bookings;
drop policy if exists "public update bookings" on bookings;


-- 2) سياسة جديدة: الزائر يقدر يحدّث الحجز — لكن ليس إلى "مؤكّد"
--    (لا يستطيع لمس حجز مؤكّد مسبقاً، ولا تعليم أي حجز كمدفوع)
create policy "anon update pending only" on bookings
  for update
  to anon
  using  (status is distinct from 'confirmed')
  with check (status in ('pending', 'awaiting_payment', 'cancelled'));


-- ملاحظة: الأدمن (authenticated) والسيرفر (service_role) غير متأثرين —
--         "admin manage bookings" تبقى كما هي، والكرون يؤكّد بصلاحية
--         service_role التي تتجاوز RLS.

-- ════════════════════════════════════════════════════════════════
--  خلصتِ ✓  ما عاد حدا يقدر يعلّم حجزه مدفوعاً إلا بدفع حقيقي مُتحقَّق.
-- ════════════════════════════════════════════════════════════════
