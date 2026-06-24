// ════════════════════════════════════════════════════════════
// verify-usdt — Supabase Edge Function
// يفحص محفظة USDT (TRC20) تلقائياً عبر Tronscan كل دقيقة.
// يطابق كل تحويل وارد بأقدم حجز معلّق بنفس المبلغ، ويؤكّده + يقفل الموعد.
// يتذكّر كل تحويل عالجه (processed_payments) حتى لا يُعاد استخدامه.
// ════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ⚠️ عنوان محفظتك للـ USDT (TRC20)
const WALLET = "TKvBio7SAkXMWsS7hELWc1DMGu5g7yj3uk";
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

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

  // 1) آخر التحويلات الواردة لمحفظتنا (الأقدم أولاً للمطابقة العادلة)
  const url =
    `https://apilist.tronscanapi.com/api/token_trc20/transfers` +
    `?limit=50&start=0&contract_address=${USDT_CONTRACT}&toAddress=${WALLET}&confirm=true`;
  const r = await fetch(url);
  const j = await r.json();
  const transfers = (j?.token_transfers || j?.data || []) as any[];

  // طبّع التحويلات: هاش + مبلغ
  const incoming = transfers
    .map((t) => {
      const to = (t.to_address || t.toAddress || "").trim();
      if (to !== WALLET) return null;
      const dec = parseInt(t.tokenInfo?.tokenDecimal ?? t.decimals ?? 6);
      const raw = t.quant ?? t.amount_str ?? t.amount ?? "0";
      const amount = Number(raw) / Math.pow(10, dec);
      const hash = t.transaction_id || t.hash || t.transactionHash || "";
      const ts = Number(t.block_ts || t.timestamp || 0);
      return hash ? { hash, amount: Number(amount.toFixed(2)), ts } : null;
    })
    .filter(Boolean) as { hash: string; amount: number; ts: number }[];

  incoming.sort((a, b) => a.ts - b.ts); // الأقدم أولاً

  let confirmed = 0;
  for (const tx of incoming) {
    // 2) هل عالجنا هذا التحويل من قبل؟
    const seen = await sb
      .from("processed_payments")
      .select("tx_hash")
      .eq("tx_hash", tx.hash)
      .maybeSingle();
    if (seen.data) continue; // سبق وعولج

    // 3) أقدم حجز معلّق بنفس المبلغ
    const { data: match } = await sb
      .from("bookings")
      .select("id,time")
      .eq("status", "awaiting_payment")
      .eq("pay_amount", tx.amount)
      .order("id", { ascending: true })
      .limit(1);

    const booking = match && match[0];

    // 4) سجّل التحويل كمُعالَج (سواء طابق أم لا) حتى لا يُعاد استخدامه
    await sb.from("processed_payments").insert({
      tx_hash: tx.hash,
      amount: tx.amount,
      booking_id: booking ? booking.id : null,
      matched: !!booking,
    });

    if (!booking) continue;

    // 5) أكّد الحجز + اقفل الموعد
    await sb.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
    const { day, time } = parseSlot(booking.time || "");
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
    JSON.stringify({ transfers: incoming.length, confirmed }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
