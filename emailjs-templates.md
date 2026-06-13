# قوالب EmailJS — Hanadi Insights

أنشئي **3 قوالب** في EmailJS → Email Templates → Create New Template.
في كل قالب اضغطي على تبويب **"Code editor"** والصقي الكود مباشرة.

---

## 1) إشعار الحجز الجديد (لهنادي) — Template ID: `template_llcycmu`

| الحقل | القيمة |
|-------|--------|
| To Email | `souchamaa35@gmail.com` |
| From Name | `Hanadi Insights` |
| Reply To | `{{from_email}}` |
| Subject | `New Booking — {{from_name}} · {{appointment}}` |

### HTML Content (الصقيه في Code Editor):

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f1210;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1210;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#141917;border-radius:12px;border:1px solid rgba(120,144,124,0.2);overflow:hidden;">

      <!-- HEADER -->
      <tr><td style="background:linear-gradient(135deg,#1a2320,#0f1210);padding:36px 40px;border-bottom:1px solid rgba(120,144,124,0.15);text-align:center;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:rgba(120,144,124,0.1);border:1px solid rgba(120,144,124,0.3);line-height:48px;font-family:Georgia,serif;font-size:1.4rem;color:#9FBBA4;margin-bottom:12px;">H</div>
        <div style="font-family:Georgia,serif;font-size:1.3rem;color:#9FBBA4;letter-spacing:0.08em;">Hanadi Insights</div>
        <div style="font-size:0.62rem;color:#56685C;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px;">FINANCIAL ANALYSIS</div>
      </td></tr>

      <!-- TITLE -->
      <tr><td style="padding:28px 40px 8px;text-align:center;">
        <div style="display:inline-block;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:20px;padding:4px 16px;font-size:0.72rem;color:#4ade80;letter-spacing:0.12em;margin-bottom:16px;">NEW BOOKING · حجز جديد</div>
        <h2 style="margin:0;color:#dddedd;font-size:1.3rem;font-weight:600;">{{from_name}}</h2>
        <p style="margin:6px 0 0;color:#6B7A72;font-size:0.85rem;">{{appointment}}</p>
      </td></tr>

      <!-- DETAILS -->
      <tr><td style="padding:20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,144,124,0.08);">
              <span style="font-size:0.7rem;color:#56685C;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:3px;">Phone · الهاتف</span>
              <span style="color:#dddedd;font-size:0.9rem;direction:ltr;display:block;">{{phone}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,144,124,0.08);">
              <span style="font-size:0.7rem;color:#56685C;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:3px;">Email · البريد</span>
              <span style="color:#9FBBA4;font-size:0.9rem;direction:ltr;display:block;">{{from_email}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,144,124,0.08);">
              <span style="font-size:0.7rem;color:#56685C;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:3px;">Session · الجلسة</span>
              <span style="color:#dddedd;font-size:0.9rem;">{{session}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;">
              <span style="font-size:0.7rem;color:#56685C;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:3px;">Message · الرسالة</span>
              <span style="color:#A8B0AC;font-size:0.88rem;line-height:1.6;">{{message}}</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:20px 40px 32px;text-align:center;border-top:1px solid rgba(120,144,124,0.08);">
        <p style="margin:0;font-size:0.7rem;color:#3d4d44;letter-spacing:0.1em;">HANADI INSIGHTS · AUTOMATED NOTIFICATION</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
```

---

## 2) تأكيد الحجز (للعميل) — Template ID: `template_confirm`

| الحقل | القيمة |
|-------|--------|
| To Email | `{{to_email}}` |
| From Name | `Hanadi Insights` |
| Subject | `Booking Confirmed · تم تأكيد حجزك — {{appt_date}}` |

### HTML Content:

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f1210;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1210;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#141917;border-radius:12px;border:1px solid rgba(120,144,124,0.2);overflow:hidden;">

      <!-- HEADER -->
      <tr><td style="background:linear-gradient(135deg,#1a2320,#0f1210);padding:36px 40px;border-bottom:1px solid rgba(120,144,124,0.15);text-align:center;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:rgba(120,144,124,0.1);border:1px solid rgba(120,144,124,0.3);line-height:48px;font-family:Georgia,serif;font-size:1.4rem;color:#9FBBA4;margin-bottom:12px;">H</div>
        <div style="font-family:Georgia,serif;font-size:1.3rem;color:#9FBBA4;letter-spacing:0.08em;">Hanadi Insights</div>
        <div style="font-size:0.62rem;color:#56685C;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px;">FINANCIAL ANALYSIS</div>
      </td></tr>

      <!-- SUCCESS BADGE -->
      <tr><td style="padding:32px 40px 8px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:50%;line-height:56px;font-size:1.6rem;margin:0 auto 16px;">✓</div>
        <h1 style="margin:0 0 6px;color:#dddedd;font-size:1.4rem;font-weight:600;">Booking Confirmed</h1>
        <p style="margin:0;color:#6B7A72;font-size:0.9rem;">تم تأكيد حجزك بنجاح</p>
      </td></tr>

      <!-- GREETING -->
      <tr><td style="padding:20px 40px 0;text-align:right;">
        <p style="margin:0;color:#A8B0AC;font-size:0.92rem;line-height:1.7;">
          مرحباً <strong style="color:#9FBBA4;">{{to_name}}</strong>،<br/>
          يسعدنا تأكيد استلام طلب حجزك. فيما يلي تفاصيل جلستك:
        </p>
        <p style="margin:8px 0 0;color:#6B7A72;font-size:0.8rem;direction:ltr;text-align:left;">
          Dear {{to_name}}, your booking has been received. Here are your session details:
        </p>
      </td></tr>

      <!-- SESSION CARD -->
      <tr><td style="padding:20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(120,144,124,0.04);border:1px solid rgba(120,144,124,0.12);border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid rgba(120,144,124,0.08);">
              <span style="font-size:0.65rem;color:#56685C;letter-spacing:0.2em;text-transform:uppercase;display:block;margin-bottom:4px;">Session Type · نوع الجلسة</span>
              <span style="color:#dddedd;font-size:0.95rem;font-weight:500;">{{session}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid rgba(120,144,124,0.08);">
              <span style="font-size:0.65rem;color:#56685C;letter-spacing:0.2em;text-transform:uppercase;display:block;margin-bottom:4px;">Date · التاريخ</span>
              <span style="color:#9FBBA4;font-size:1rem;font-weight:600;direction:ltr;display:block;">{{appt_date}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;">
              <span style="font-size:0.65rem;color:#56685C;letter-spacing:0.2em;text-transform:uppercase;display:block;margin-bottom:4px;">Time · الوقت</span>
              <span style="color:#9FBBA4;font-size:1rem;font-weight:600;direction:ltr;display:block;">{{appt_time}}</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- NOTE -->
      <tr><td style="padding:0 40px 28px;">
        <p style="margin:0;color:#6B7A72;font-size:0.82rem;line-height:1.7;text-align:right;">
          سيصلك تذكير تلقائي قبل موعدك بـ <strong style="color:#9FBBA4;">ساعتين</strong>. للاستفسار تواصلي معنا مباشرة.
        </p>
        <p style="margin:6px 0 0;color:#3d4d44;font-size:0.75rem;direction:ltr;text-align:left;">
          You will receive an automatic reminder 2 hours before your session.
        </p>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:20px 40px 28px;text-align:center;border-top:1px solid rgba(120,144,124,0.08);">
        <p style="margin:0 0 6px;color:#78907C;font-family:Georgia,serif;font-size:0.95rem;">Hanadi Insights</p>
        <p style="margin:0;font-size:0.65rem;color:#3d4d44;letter-spacing:0.1em;">PROFESSIONAL FINANCIAL ANALYSIS · التحليل المالي الاحترافي</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
```

---

## 3) تذكير الموعد (للعميل) — Template ID: `template_reminder`

| الحقل | القيمة |
|-------|--------|
| To Email | `{{to_email}}` |
| From Name | `Hanadi Insights` |
| Subject | `Reminder · تذكير: جلستك اليوم الساعة {{appt_time}}` |

### HTML Content:

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f1210;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1210;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#141917;border-radius:12px;border:1px solid rgba(120,144,124,0.2);overflow:hidden;">

      <!-- HEADER -->
      <tr><td style="background:linear-gradient(135deg,#1a2320,#0f1210);padding:36px 40px;border-bottom:1px solid rgba(120,144,124,0.15);text-align:center;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:rgba(120,144,124,0.1);border:1px solid rgba(120,144,124,0.3);line-height:48px;font-family:Georgia,serif;font-size:1.4rem;color:#9FBBA4;margin-bottom:12px;">H</div>
        <div style="font-family:Georgia,serif;font-size:1.3rem;color:#9FBBA4;letter-spacing:0.08em;">Hanadi Insights</div>
        <div style="font-size:0.62rem;color:#56685C;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px;">FINANCIAL ANALYSIS</div>
      </td></tr>

      <!-- REMINDER BADGE -->
      <tr><td style="padding:32px 40px 8px;text-align:center;">
        <div style="display:inline-block;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);border-radius:20px;padding:5px 18px;font-size:0.7rem;color:#fbbf24;letter-spacing:0.15em;margin-bottom:18px;">⏰ REMINDER · تذكير</div>
        <h1 style="margin:0 0 6px;color:#dddedd;font-size:1.35rem;font-weight:600;">Your session starts in 2 hours</h1>
        <p style="margin:0;color:#6B7A72;font-size:0.9rem;">جلستك تبدأ بعد ساعتين</p>
      </td></tr>

      <!-- GREETING -->
      <tr><td style="padding:20px 40px 0;text-align:right;">
        <p style="margin:0;color:#A8B0AC;font-size:0.92rem;line-height:1.7;">
          مرحباً <strong style="color:#9FBBA4;">{{to_name}}</strong>،<br/>
          هذا تذكير بموعد جلستك القادمة خلال ساعتين. نأمل أن تكوني مستعدة.
        </p>
      </td></tr>

      <!-- SESSION CARD -->
      <tr><td style="padding:20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(251,191,36,0.03);border:1px solid rgba(251,191,36,0.12);border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid rgba(120,144,124,0.08);">
              <span style="font-size:0.65rem;color:#56685C;letter-spacing:0.2em;text-transform:uppercase;display:block;margin-bottom:4px;">Session · الجلسة</span>
              <span style="color:#dddedd;font-size:0.95rem;font-weight:500;">{{session}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid rgba(120,144,124,0.08);">
              <span style="font-size:0.65rem;color:#56685C;letter-spacing:0.2em;text-transform:uppercase;display:block;margin-bottom:4px;">Date · التاريخ</span>
              <span style="color:#9FBBA4;font-size:1rem;font-weight:600;direction:ltr;display:block;">{{appt_date}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;">
              <span style="font-size:0.65rem;color:#56685C;letter-spacing:0.2em;text-transform:uppercase;display:block;margin-bottom:4px;">Time · الوقت</span>
              <span style="color:#fbbf24;font-size:1.1rem;font-weight:700;direction:ltr;display:block;">{{appt_time}}</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- NOTE -->
      <tr><td style="padding:0 40px 28px;text-align:right;">
        <p style="margin:0;color:#6B7A72;font-size:0.82rem;line-height:1.7;">
          نراك قريباً 🌿 إذا احتجتِ تعديل الموعد، تواصلي معنا في أقرب وقت.
        </p>
        <p style="margin:6px 0 0;color:#3d4d44;font-size:0.75rem;direction:ltr;text-align:left;">
          We look forward to your session. Please contact us if you need to reschedule.
        </p>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:20px 40px 28px;text-align:center;border-top:1px solid rgba(120,144,124,0.08);">
        <p style="margin:0 0 6px;color:#78907C;font-family:Georgia,serif;font-size:0.95rem;">Hanadi Insights</p>
        <p style="margin:0;font-size:0.65rem;color:#3d4d44;letter-spacing:0.1em;">PROFESSIONAL FINANCIAL ANALYSIS · التحليل المالي الاحترافي</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
```

---

## ملاحظات الإعداد

| # | ما تفعلينه | أين |
|---|------------|-----|
| 1 | أنشئي القالبَين `template_confirm` و `template_reminder` | EmailJS → Email Templates |
| 2 | في كل قالب افتحي تبويب **"Code editor"** والصقي الكود كاملاً | داخل القالب |
| 3 | فعّلي API خارج المتصفح | EmailJS → Account → Security → ✅ "Allow EmailJS API for non-browser" |
| 4 | انسخي الـ **Private Key** وضعيه في `supabase-reminders.sql` | مكان `PUT_YOUR_PRIVATE_KEY_HERE` |
| 5 | شغّلي `supabase-reminders.sql` كاملاً | Supabase → SQL Editor → Run |
