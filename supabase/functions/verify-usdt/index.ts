// ════════════════════════════════════════════════════════════
// verify-usdt — Supabase Edge Function
// يفحص محفظة USDT (TRC20) تلقائياً عبر Tronscan كل دقيقة،
// ويؤكّد الحجوزات التي وصلها المبلغ الفريد المطابق + يقفل الموعد.
// ════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ⚠️ بدّلي هذا بعنوان محفظتك الحقيقي للـ USDT (TRC20)
const WALLET = "TKvBio7SAkXMWsS7hELWc1DMGu5g7yj3uk";
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

// يحوّل اسم اليوم العربي لأقرب تاريخ قادم
function nextDateForDay(arabicDay: string): string | null {
  const map: Record<string, number> = {
    "الأحد": 0, "الاثنين": 1, "الإثنين": 1, "الثلاثاء": 2,
    "الأربعاء": 3, "الخميس": 4, "الجمعة": 5, "السبت": 6,
  };
  const t = map[arabicDay];
  if (t === undefined) return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ((t - d.getDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
}

function parseSlot(timeField: string): { day: string; time: string } {
  const raw = (timeField || "").trim();
  const parts = raw.split("—").map((x) => x.trim());
  if (parts.length >= 2) return { day: parts[0], time: parts.slice(1).join(" ").trim() };
  return { day: "", time: raw };
}

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1) الحجوزات التي بانتظار الدفع ولها مبلغ فريد محدد
  const { data: pending, error: pErr } = await sb
    .from("bookings")
    .select("id,time,pay_amount,client_email,client_name")
    .eq("status", "awaiting_payment")
    .not("pay_amount", "is", null);

  if (pErr) return new Response(JSON.stringify({ error: pErr.message }), { status: 500 });
  if (!pending || !pending.length) {
    return new Response(JSON.stringify({ checked: 0, confirmed: 0 }), { status: 200 });
  }

  // 2) آخر التحويلات الواردة لمحفظتنا عبر Tronscan
  const url =
    `https://apilist.tronscanapi.com/api/token_trc20/transfers` +
    `?limit=40&start=0&contract_address=${USDT_CONTRACT}&toAddress=${WALLET}&confirm=true`;
  const r = await fetch(url);
  const j = await r.json();
  const transfers = (j?.token_transfers || j?.data || []) as any[];

  // مبالغ التحويلات الواردة (مقرّبة لخانتين عشريتين)
  const incoming = new Set<string>();
  for (const t of transfers) {
    const to = (t.to_address || t.toAddress || "").trim();
    if (to !== WALLET) continue;
    const dec = parseInt(t.tokenInfo?.tokenDecimal ?? t.decimals ?? 6);
    const raw = t.quant ?? t.amount_str ?? t.amount ?? "0";
    const amt = Number(raw) / Math.pow(10, dec);
    incoming.add(amt.toFixed(2));
  }

  // 3) طابق كل حجز معلّق بمبلغه الفريد
  let confirmed = 0;
  for (const b of pending) {
    const expect = Number(b.pay_amount).toFixed(2);
    if (!incoming.has(expect)) continue;

    // تأكيد الحجز
    await sb.from("bookings").update({ status: "confirmed" }).eq("id", b.id);

    // قفل الموعد
    const { day, time } = parseSlot(b.time || "");
    if (day && time) {
      const slot_date = nextDateForDay(day);
      const ins = await sb.from("slot_locks").insert({ day, time, slot_date });
      if (ins.error && /slot_date/.test(ins.error.message || "")) {
        await sb.from("slot_locks").insert({ day, time });
      }
    }
    confirmed++;
  }

  return new Response(
    JSON.stringify({ checked: pending.length, confirmed }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
