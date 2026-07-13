// ════════════════════════════════════════════════════════════
// send-reminders — يرسل تذكيراً للعميل قبل موعده المحجوز بساعتين
// يُستدعى دورياً (كل 15 دقيقة) عبر pg_cron.
// الموعد مخزّن كـ "اسم اليوم — الوقت" (مثال: "السبت — 6:30 م")
// المنطقة الزمنية الافتراضية: دمشق/الخليج (UTC+3)
// ════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? Deno.env.get("RESEND_KEY") ?? "";
const FROM = "Hanadi Insights <info@hanadiabdullah.com>";
const TZ_OFFSET = 3; // UTC+3

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const DAYS: Record<string, number> = {
  "الأحد": 0, "الاحد": 0, "الإثنين": 1, "الاثنين": 1, "الثلاثاء": 2,
  "الأربعاء": 3, "الاربعاء": 3, "الخميس": 4, "الجمعة": 5, "السبت": 6,
};

// يفصل "السبت — 6:30 م" إلى { dayName, timeStr }
function splitSlot(raw: string) {
  const parts = String(raw || "").split("—").map((x) => x.trim());
  if (parts.length >= 2) return { dayName: parts[0], timeStr: parts.slice(1).join(" ").trim() };
  return { dayName: "", timeStr: String(raw || "").trim() };
}

// يحوّل "6:30 م" إلى {h,m} بنظام 24 ساعة
function parseTime(t: string): { h: number; m: number } | null {
  const s = String(t || "");
  const match = s.match(/(\d{1,2})[:٫:]?(\d{2})?/);
  if (!match) return null;
  let h = parseInt(match[1]); const m = parseInt(match[2] || "0");
  const isPM = /م|مساء|pm/i.test(s) && !/ص|صباح|am/i.test(s);
  const isAM = /ص|صباح|am/i.test(s);
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  if (isNaN(h) || isNaN(m)) return null;
  return { h, m };
}

// يحسب توقيت الموعد القادم (UTC) لاسم يوم + وقت، بمنطقة UTC+3
function nextAppointmentUTC(dayName: string, timeStr: string): Date | null {
  const target = DAYS[dayName.trim()];
  const tm = parseTime(timeStr);
  if (target === undefined || !tm) return null;
  const now = new Date();
  // الوقت المحلي الحالي (UTC+3)
  const local = new Date(now.getTime() + TZ_OFFSET * 3600 * 1000);
  const localDay = local.getUTCDay();
  let addDays = (target - localDay + 7) % 7;
  // ابنِ موعد اليوم المستهدف بالوقت المطلوب (محلي)
  let apptLocal = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + addDays, tm.h, tm.m, 0));
  // حوّل من المحلي إلى UTC
  let apptUTC = new Date(apptLocal.getTime() - TZ_OFFSET * 3600 * 1000);
  // إن كان الموعد اليوم لكنه مضى، انتقل للأسبوع القادم
  if (apptUTC.getTime() <= now.getTime() && addDays === 0) {
    apptUTC = new Date(apptUTC.getTime() + 7 * 24 * 3600 * 1000);
  }
  return apptUTC;
}

function reminderHTML(name: string, type: string, day: string, time: string, code: string) {
  const inner =
    `<p style="color:#eef2ee;font-size:17px;margin:0 0 14px;font-weight:700">مرحباً ${name || ""}،</p>` +
    `<p style="color:#cdd6cd;font-size:15px;line-height:2;margin:0">هذا تذكير ودّي بأن موعد استشارتك بعد <b style="color:#bcd8c1">ساعتين تقريباً</b>. نتطلّع للقائك 🌿</p>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;font-size:14px">` +
    row("نوع الاستشارة", type) + row("الموعد", (day || "") + " — " + (time || "")) + row("رمز طلبك", code, "#bcd8c1") +
    `</table>` +
    `<p style="color:#9aa89b;font-size:13px;line-height:1.9;margin-top:22px">يُفضّل الانضمام قبل الموعد بدقائق. لأي استفسار، ردّ على هذا الإيميل مباشرةً.</p>`;
  return shell("تذكير بالموعد", inner);
}
function row(l: string, v: string, a?: string) {
  return `<tr><td valign="top" style="color:#a9c6ae;padding:12px 0 12px 18px;border-bottom:1px solid rgba(159,187,164,.16);font-size:13px;white-space:nowrap">${l}</td>` +
    `<td valign="top" style="text-align:left;padding:12px 0;border-bottom:1px solid rgba(159,187,164,.16);font-size:14px;line-height:1.55;color:${a || "#f0f4ef"};font-weight:600">${v || "—"}</td></tr>`;
}
function shell(sub: string, inner: string) {
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><style>:root{color-scheme:dark;supported-color-schemes:dark}body{margin:0;padding:0;background-color:#3c483e!important}</style></head>` +
    `<body bgcolor="#3c483e" style="margin:0;padding:0;background-color:#3c483e"><table role="presentation" width="100%" bgcolor="#3c483e" cellpadding="0" cellspacing="0" style="background-color:#3c483e"><tr><td align="center" style="padding:40px 16px">` +
    `<table role="presentation" width="540" bgcolor="#3c483e" cellpadding="0" cellspacing="0" dir="rtl" style="width:540px;max-width:100%;background-color:#3c483e;font-family:Tahoma,Arial,sans-serif"><tr><td style="padding:12px">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #8FB996"><tr><td style="padding:2px">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(159,187,164,.35)"><tr><td bgcolor="#3c483e" style="background-color:#3c483e;padding:40px 34px">` +
    `<div style="text-align:center;padding-bottom:22px"><div style="font-family:Georgia,serif;font-size:25px;font-weight:600;color:#FFFFFF;letter-spacing:.5px">Hanadi Insights</div>` +
    `<div style="font-size:10px;color:#e6efe4;margin-top:10px;letter-spacing:4px;text-transform:uppercase">${sub}</div>` +
    `<div style="margin-top:13px;color:#8FB996;font-size:13px;letter-spacing:6px">◆</div></div>` +
    inner +
    `<div style="border-top:1px solid rgba(159,187,164,.28);margin-top:26px;padding-top:18px;text-align:center;color:#aab9aa;font-size:11px">© Hanadi Insights — منصة تحليل اقتصادي وأسواق عالمية</div>` +
    `</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`;
}

async function sendMail(to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, reply_to: "info@hanadiabdullah.com" }),
  });
  return r.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // الحجوزات المؤكَّدة التي لم يُذكَّر بها بعد
    const { data: rows } = await sb.from("bookings").select("*").eq("status", "confirmed");
    const now = Date.now();
    let sent = 0, checked = 0;
    for (const b of (rows || [])) {
      if (b.reminded) continue;
      if (!b.client_email) continue;
      checked++;
      const { dayName, timeStr } = splitSlot(b.time);
      const appt = nextAppointmentUTC(dayName, timeStr);
      if (!appt) continue;
      const diffMin = (appt.getTime() - now) / 60000;
      // أرسل عندما يكون الموعد ضمن الساعتين القادمتين (نافذة أمان حتى 125 دقيقة)
      if (diffMin > 0 && diffMin <= 125) {
        const code = (String(b.message || "").match(/HN-[A-Z0-9-]+/) || [""])[0];
        const ok = await sendMail(
          b.client_email,
          "تذكير بموعد استشارتك بعد ساعتين — Hanadi Insights",
          reminderHTML(b.client_name || "", b.consultation_type || "", dayName, timeStr, code),
        );
        if (ok) { await sb.from("bookings").update({ reminded: true }).eq("id", b.id); sent++; }
      }
    }
    return json({ ok: true, checked, sent });
  } catch (e) {
    console.error("[send-reminders]", String(e));
    return json({ error: String(e) }, 500);
  }
});
