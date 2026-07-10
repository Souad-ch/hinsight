// ════════════════════════════════════════════════════════════
// send-email — يبعت إيميل عبر Resend من info@hanadiabdullah.com
// يستقبل: { to, subject, html, reply_to }
// ════════════════════════════════════════════════════════════
const RESEND_API_KEY = "re_RcBfGv9j_7pc7ULYzDjHenBh1spuYaLWH";
const FROM = "Hanadi Insights <info@hanadiabdullah.com>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { to, subject, html, reply_to } = await req.json();
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "missing fields (to, subject, html)" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: reply_to || "info@hanadiabdullah.com",
      }),
    });
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      status: r.status, headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
