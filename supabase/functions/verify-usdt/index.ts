// ════════════════════════════════════════════════════════════
// verify-usdt — Supabase Edge Function
// يفحص محفظة USDT (TRC20) عبر TronGrid، يطابق كل تحويل وارد
// بأقدم حجز معلّق بنفس المبلغ، يؤكّده + يقفل الموعد.
// يتذكّر كل تحويل عالجه (processed_payments) حتى لا يُعاد استخدامه.
// ════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WALLET = "TJecHP1xkkXCWWrRRUZyYYkCNSS1DT4Yr9";
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

  // ── جلب آخر تحويلات USDT الواردة عبر TronGrid ──
  const url =
    `https://api.trongrid.io/v1/accounts/${WALLET}/transactions/trc20` +
    `?only_to=true&limit=50&contract_address=${USDT_CONTRACT}`;

  let transfers: any[] = [];
  try {
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    const text = await r.text();
    let j: any = {};
    try { j = JSON.parse(text); } catch { j = {}; }
    transfers = j?.data || [];
  } catch (e) {
    return new Response(JSON.stringify({ error: "fetch failed", detail: String(e) }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }

  const incoming = transfers
    .map((t) => {
      const to = (t.to || "").trim();
      if (to !== WALLET) return null;
      const dec = parseInt(t.token_info?.decimals ?? 6);
      const amount = Number(t.value || "0") / Math.pow(10, dec);
      const hash = t.transaction_id || "";
      const ts = Number(t.block_timestamp || 0);
      return hash ? { hash, amount: Number(amount.toFixed(2)), ts } : null;
    })
    .filter(Boolean) as { hash: string; amount: number; ts: number }[];

  incoming.sort((a, b) => a.ts - b.ts);

  let confirmed = 0;
  for (const tx of incoming) {
    const seen = await sb
      .from("processed_payments")
      .select("tx_hash")
      .eq("tx_hash", tx.hash)
      .maybeSingle();
    if (seen.data) continue;

    const { data: match } = await sb
      .from("bookings")
      .select("id,time")
      .eq("status", "awaiting_payment")
      .eq("pay_amount", tx.amount)
      .order("id", { ascending: true })
      .limit(1);

    const booking = match && match[0];

    await sb.from("processed_payments").insert({
      tx_hash: tx.hash,
      amount: tx.amount,
      booking_id: booking ? booking.id : null,
      matched: !!booking,
    });

    if (!booking) continue;

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
