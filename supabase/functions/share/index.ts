// ════════════════════════════════════════════════════════════
// share — رابط مشاركة بمعاينة خاصة لكل مقال/تحليل
// يستقبل: ?s=<slug>  → يعرض وسوم OG (عنوان/وصف المقال) لبرامج
// المعاينة (واتساب/تويتر...)، ويحوّل الزائر فوراً لصفحة المقال.
// ════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://hanadiabdullah.com";

function esc(s: string) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("s") || "").trim();
    if (!slug) return Response.redirect(SITE, 302);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: a } = await sb.from("articles").select("title,excerpt,content,content_type,slug")
      .eq("slug", slug).eq("published", true).maybeSingle();

    const isArticle = !a || a.content_type === "article";
    const target = `${SITE}/${isArticle ? "articles" : "analyses"}?a=${encodeURIComponent(slug)}`;
    if (!a) return Response.redirect(target, 302);

    const title = esc(a.title || "Hanadi Insights");
    const desc = esc((a.excerpt || String(a.content || "").replace(/<[^>]+>/g, "")).slice(0, 160));

    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>${title} — Hanadi Insights</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Hanadi Insights">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${esc(target)}">
<meta property="og:image" content="${SITE}/og-image.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
</head><body style="background:#0C0B0F;color:#DDDEDD;font-family:Tahoma;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<p>جارٍ فتح المقال… <a href="${esc(target)}" style="color:#9FBBA4">اضغط هنا</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" } });
  } catch (_e) {
    return Response.redirect(SITE, 302);
  }
});
