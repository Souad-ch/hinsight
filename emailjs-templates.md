# قوالب EmailJS — Hanadi Insights

أنشئي **3 قوالب** في EmailJS (Email Templates → Create New Template).
انسخي الاسم (Template ID) والمحتوى تماماً كما هو.

---

## 1) قالب الإشعار لهنادي  — Template ID: `template_llcycmu`

**To Email:** `souchamaa35@gmail.com`
**From Name:** `موقع هنادي`
**Reply To:** `{{from_email}}`
**Subject:** `📩 حجز جديد من {{from_name}}`

**Content:**
```
وصلك طلب حجز جديد:

الاسم: {{from_name}}
الهاتف: {{phone}}
الإيميل: {{from_email}}
نوع الجلسة: {{session}}
موعد الجلسة: {{appointment}}

الرسالة:
{{message}}
```

---

## 2) قالب التأكيد للعميل  — Template ID: `template_confirm`

**To Email:** `{{to_email}}`
**From Name:** `Hanadi Insights`
**Subject:** `✅ تأكيد حجز جلستك مع هنادي`

**Content:**
```
مرحباً {{to_name}}،

تم استلام طلب حجزك بنجاح ✅

تفاصيل الجلسة:
• النوع: {{session}}
• التاريخ: {{appt_date}}
• الوقت: {{appt_time}}

سنتواصل معك لتأكيد الموعد نهائياً. وستصلك رسالة تذكير قبل
الموعد بساعتين.

شكراً لثقتك،
هنادي للتحليل المالي
```

---

## 3) قالب التذكير  — Template ID: `template_reminder`

**To Email:** `{{to_email}}`
**From Name:** `Hanadi Insights`
**Subject:** `⏰ تذكير: جلستك بعد ساعتين`

**Content:**
```
مرحباً {{to_name}}،

هذا تذكير ودّي بأن جلستك ({{session}}) ستبدأ بعد ساعتين تقريباً.

• التاريخ: {{appt_date}}
• الوقت: {{appt_time}}

نراك قريباً 🌿
هنادي للتحليل المالي
```

---

## ملاحظات مهمة

1. **أسماء المتغيرات** بين `{{ }}` يجب أن تطابق ما في الكود تماماً.
2. قالب التذكير `template_reminder` يُرسل من **Supabase** تلقائياً —
   لذلك فعّلي من **Account → Security**:
   ✅ "Allow EmailJS API for non-browser applications"
   وانسخي الـ **Private Key** والصقيه في ملف `supabase-reminders.sql`.
3. القالبان 1 و 2 يُرسلان من المتصفح مباشرة (لا يحتاجان أي إعداد إضافي).
