-- ════════════════════════════════════════════════════════════
-- إعداد التحقق التلقائي من دفعات USDT
-- نفّذي هذا مرة واحدة في Supabase → SQL Editor
-- ════════════════════════════════════════════════════════════

-- 1) عمود المبلغ الفريد لكل حجز
alter table bookings add column if not exists pay_amount numeric;

-- 2) تفعيل الإضافات اللازمة للجدولة والاتصال
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 3) جدولة استدعاء الـ Edge Function كل دقيقة
--    ⚠️ بدّلي:
--      <PROJECT_REF>     => معرّف مشروعك (من رابط Supabase)
--      <SERVICE_ROLE_KEY> => مفتاح service_role (Settings → API)
select cron.schedule(
  'verify-usdt-every-minute',
  '* * * * *',
  $$
  select net.http_post(
    url    := 'https://<PROJECT_REF>.supabase.co/functions/v1/verify-usdt',
    headers:= '{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body   := '{}'::jsonb
  );
  $$
);

-- لإيقاف الجدولة لاحقاً إن لزم:
-- select cron.unschedule('verify-usdt-every-minute');
