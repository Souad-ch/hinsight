// ════════════════════════════════════════════════════════════
// support-ai — بوت دعم مقيّد بموقع Hanadi Insights فقط (OpenAI)
// يرد أولاً بالذكاء الاصطناعي، ويحوّل لموظف عند الطلب.
// ════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// يقبل عدة تسميات شائعة للمفتاح تفادياً لخطأ الاسم
const OPENAI_KEY =
  Deno.env.get("OPENAI_KEY") ??
  Deno.env.get("OPENAI_API_KEY") ??
  Deno.env.get("OPEN_AI_KEY") ??
  Deno.env.get("OPENAI") ??
  "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const SYSTEM = `أنت "مساعد هنادي" — بوت الدعم الفني لمنصة Hanadi Insights (منصة تحليل اقتصادي وأسواق عالمية).

مهمتك مساعدة زوّار الموقع بخصوص خدمات المنصة فقط.

تجيب عن: الخدمات والاستشارات وأسعارها · كيفية الحجز والدفع · المقالات والتحليلات المتوفرة على الموقع (المذكورة في القائمة أدناه فقط) · أيام وأوقات الاستشارات.

قواعد صارمة:
- إذا سُئلت عن أي موضوع خارج المنصة (رياضة، سياسة، أخبار عامة، برمجة، طقس، أي شيء عام) اعتذر بلطف: "أنا مخصص لمساعدتك في خدمات Hanadi Insights فقط 🙏".
- ممنوع منعاً باتاً إعطاء توصيات شراء أو بيع، أو نقاط دخول/خروج، أو توقّع أسعار، أو ضمان أرباح. الاستشارة تعليمية وتحليلية فقط.
- لا تخترع معلومات. اقترح فقط المقالات/التحليلات الموجودة في القائمة أدناه حرفياً. إذا لم يوجد محتوى مطابق قل ذلك بصراحة.
- كن مختصراً، ودوداً، ومهنياً، وبالعربية دائماً.

معلومات المنصة:
- الاستشارات وأسعارها: تقييم المتداول (250$) · هندسة المخاطر (400$) · قراءة المشهد الاقتصادي (600$) · عضوية VIP الشهرية (1000$).
- أيام الاستشارات: السبت / الثلاثاء / الخميس، من 6:00 إلى 9:00 مساءً.
- طريقة الحجز: طلب من صفحة الاستشارات ← مراجعة ← تأكيد ← دفع بعملة USDT عبر شبكة TRC20 ← تثبيت الموعد تلقائياً.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    console.log("[support-ai] request received; OPENAI_KEY set:", OPENAI_KEY ? `yes (len ${OPENAI_KEY.length})` : "NO — المفتاح غير موجود");
    const { session_code, message } = await req.json();
    console.log("[support-ai] session_code:", session_code, "| message:", message);
    if (!session_code || !message) return json({ error: "missing session_code/message" }, 400);
    if (!OPENAI_KEY) {
      console.error("[support-ai] OPENAI_KEY is empty — أضِف السيكرت باسم OPENAI_KEY في Edge Functions → Secrets");
      return json({ error: "no_openai_key", detail: "OPENAI_KEY secret is not set on the function" }, 200);
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // سجل المحادثة
    const { data: msgs } = await sb.from("support_messages")
      .select("sender,text,needs_human").eq("session_code", session_code).order("created_at", { ascending: true });

    // إن كانت محوّلة لموظف: لا يرد البوت
    if ((msgs || []).some((m: any) => m.needs_human)) return json({ skip: true, reason: "human" });

    // طلب التحويل لموظف بشري
    if (/مختص|موظف|شخص|إنسان|انسان|بشري|human|agent|real person/i.test(message)) {
      await sb.from("support_messages").update({ needs_human: true }).eq("session_code", session_code);
      const reply = "سأحوّلك لأحد المختصين، يُرجى الانتظار قليلاً وسيتم الرد عليك 🙏";
      await sb.from("support_messages").insert({ session_code, sender: "bot", text: reply });
      return json({ reply, handoff: true });
    }

    // المحتوى الحقيقي المتوفر (مقالات/تحليلات منشورة)
    let list = "لا يوجد محتوى منشور حالياً.";
    try {
      const { data: arts } = await sb.from("articles").select("title,content_type").eq("published", true).limit(40);
      if (arts && arts.length) list = arts.map((a: any) => `- ${a.title} (${a.content_type === "article" ? "مقال" : "تحليل"})`).join("\n");
    } catch (_) { /* ignore */ }

    const chat: any[] = [{ role: "system", content: SYSTEM + "\n\nالمقالات والتحليلات المتوفرة حالياً:\n" + list }];
    (msgs || []).slice(-10).forEach((m: any) => chat.push({ role: m.sender === "customer" ? "user" : "assistant", content: m.text }));
    chat.push({ role: "user", content: message });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: chat, temperature: 0.3, max_tokens: 400 }),
    });
    const d = await r.json();
    console.log("[support-ai] OpenAI status:", r.status);
    if (!r.ok) {
      console.error("[support-ai] OpenAI error:", JSON.stringify(d));
      return json({ error: "openai", detail: d }, 200);
    }
    const reply = d?.choices?.[0]?.message?.content?.trim() || "عذراً، تعذّر الرد الآن، وسيتواصل معك أحد المختصين.";
    const ins = await sb.from("support_messages").insert({ session_code, sender: "bot", text: reply });
    if (ins.error) console.error("[support-ai] insert reply failed:", JSON.stringify(ins.error));
    console.log("[support-ai] reply sent OK");
    return json({ reply });
  } catch (e) {
    console.error("[support-ai] exception:", String(e), (e as any)?.stack || "");
    return json({ error: String(e) }, 500);
  }
});
