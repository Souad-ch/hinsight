-- ════════════════════════════════════════════════════════════════
--  فحص حالة RLS — للقراءة فقط، لا يعدّل أي شيء
--  شغّليه في Supabase → SQL Editor → Run، وابعتيلي النتيجة
-- ════════════════════════════════════════════════════════════════
select
  t.tablename                                   as "الجدول",
  case when t.rowsecurity then '✅ مفعّل' else '🔴 غير مفعّل' end as "RLS",
  coalesce(
    string_agg(
      p.policyname || ' (' || p.cmd || ' → ' || array_to_string(p.roles, ',') || ')',
      '  |  '
    ),
    '— لا توجد سياسات —'
  )                                             as "السياسات"
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname and p.tablename = t.tablename
where t.schemaname = 'public'
group by t.tablename, t.rowsecurity
order by t.rowsecurity asc, t.tablename;
