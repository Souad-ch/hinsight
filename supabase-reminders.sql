-- ════════════════════════════════════════════════════════════════
--  Hanadi Insights — تذكير تلقائي قبل ساعتين من الموعد
--  كل شي يعمل داخل Supabase (بدون أي سيرفر خارجي)
-- ════════════════════════════════════════════════════════════════
--
--  ما الذي يفعله هذا الملف؟
--  • يضيف عمودَين للحجوزات: موعد الجلسة + هل أُرسل التذكير.
--  • يفعّل إضافتَي pg_cron و pg_net (مدمجتان في Supabase).
--  • ينشئ مهمّة تعمل كل 10 دقائق: تبحث عن الحجوزات التي
--    موعدها بعد ~ساعتين ولم يُرسل لها تذكير، وترسل إيميل تذكير
--    عبر EmailJS، ثم تعلّمها كـ "أُرسل".
--
--  ⚠️ قبل التشغيل: عدّلي القيم الثلاث في الأسفل (علّمتها بـ <<<<).
-- ════════════════════════════════════════════════════════════════


-- ── 1) أعمدة الموعد والتذكير ─────────────────────────────────────
alter table bookings add column if not exists appointment_at timestamptz;
alter table bookings add column if not exists reminder_sent  boolean default false;


-- ── 2) تفعيل الإضافات ────────────────────────────────────────────
create extension if not exists pg_cron;
create extension if not exists pg_net;


-- ── 3) دالة إرسال التذكيرات ──────────────────────────────────────
create or replace function send_booking_reminders()
returns void
language plpgsql
security definer
as $$
declare
  b record;
begin
  for b in
    select * from bookings
    where reminder_sent = false
      and appointment_at is not null
      and appointment_at between now() + interval '110 minutes'
                             and now() + interval '130 minutes'
  loop
    -- إرسال عبر EmailJS REST API
    perform net.http_post(
      url     := 'https://api.emailjs.com/api/v1.0/email/send',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body    := jsonb_build_object(
        'service_id',   'service_c8o89cr',                 -- Service ID
        'template_id',  'template_1e1hk15',                -- Template ID للتذكير
        'user_id',      '6NHm0wz_2eclb5bbW',               -- Public Key
        'accessToken',  'yrrhrdt64w2IbV_SXHhUL',           -- Private Key
        'template_params', jsonb_build_object(
          'to_name',     b.client_name,
          'to_email',    b.client_email,
          'session',     coalesce(b.consultation_type,'جلسة استشارية'),
          'appt_date',   b.date::text,
          'appt_time',   b.time::text,
          'appointment', b.date::text || ' — ' || b.time::text
        )
      )
    );

    update bookings set reminder_sent = true where id = b.id;
  end loop;
end;
$$;


-- ── 4) جدولة المهمّة كل 10 دقائق ─────────────────────────────────
-- (إذا أردتِ إعادة الجدولة لاحقاً، شغّلي أولاً:
--  select cron.unschedule('booking-reminders');)
select cron.schedule(
  'booking-reminders',
  '*/10 * * * *',
  $$ select send_booking_reminders(); $$
);


-- ════════════════════════════════════════════════════════════════
--  خطوات الإعداد (مرة واحدة فقط)
-- ════════════════════════════════════════════════════════════════
--
--  1. في EmailJS أنشئي قالبَين جديدَين:
--       • template_confirm   ← تأكيد الحجز (يُرسل فوراً عند الحجز)
--       • template_reminder  ← تذكير (يُرسل قبل ساعتين)
--     (نصوص القالبَين موجودة في ملف emailjs-templates.md)
--
--  2. فعّلي استخدام الـ API من خارج المتصفح:
--       EmailJS → Account → Security →
--       فعّلي "Allow EmailJS API for non-browser applications"
--       وانسخي الـ Private Key.
--
--  3. الصقي الـ Private Key مكان PUT_YOUR_PRIVATE_KEY_HERE أعلاه.
--
--  4. شغّلي كامل هذا الملف في:
--       Supabase → SQL Editor → New query → الصق → Run.
--
--  ✓ خلصتِ. التذكير صار تلقائي بالكامل.
--
--  للاختبار السريع: شغّلي يدوياً
--       select send_booking_reminders();
-- ════════════════════════════════════════════════════════════════
