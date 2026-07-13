# إعداد تذكير الموعد (قبل الموعد بساعتين)

## 1) أضيفي عمود «reminded» للحجوزات
من Supabase → SQL Editor → شغّلي:

```sql
alter table bookings add column if not exists reminded boolean default false;
```

## 2) انشري الدالة
Supabase → Edge Functions → أنشئي دالة جديدة باسم **send-reminders** والصقي كود
`supabase/functions/send-reminders/index.ts` ثم Deploy.

> تحتاج الدالة السيكرت `RESEND_API_KEY` (نفس اللي أضفتيه لـ send-email) — موجود مسبقاً.

## 3) جدوليها كل 15 دقيقة (pg_cron)
من SQL Editor شغّلي (مرة واحدة):

```sql
-- فعّلي الإضافات إن لم تكن مفعّلة
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- جدولة: كل 15 دقيقة تستدعي دالة التذكير
select cron.schedule(
  'send-appointment-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url    := 'https://ozxwyyeyxmpkhsygntoy.supabase.co/functions/v1/send-reminders',
    headers:= '{"Content-Type":"application/json","Authorization":"Bearer SB_ANON_OR_SERVICE_KEY"}'::jsonb,
    body   := '{}'::jsonb
  );
  $$
);
```

استبدلي `SB_ANON_OR_SERVICE_KEY` بمفتاح **service_role** (من Project Settings → API) أو مفتاح anon — الأفضل service_role.

## للإلغاء لاحقاً
```sql
select cron.unschedule('send-appointment-reminders');
```

## ملاحظات
- المنطقة الزمنية المفترضة **UTC+3** (دمشق/الخليج). لتغييرها عدّلي `TZ_OFFSET` في الدالة.
- يُرسَل التذكير مرة واحدة فقط لكل حجز (عمود `reminded`).
- الموعد يُحسَب من «اسم اليوم + الوقت» المخزّن في الحجز (أقرب يوم قادم مطابق).
