/**
 * ════════════════════════════════════════════════════════════
 *  Hanadi Insights — Google Sheets Booking Webhook
 * ════════════════════════════════════════════════════════════
 *
 *  خطوات الإعداد (10 دقائق):
 *
 *  1. افتحي https://sheets.google.com وأنشئي جدولاً جديداً.
 *     سمّيه مثلاً: "حجوزات هنادي".
 *
 *  2. من القائمة العلوية: Extensions ← Apps Script.
 *
 *  3. احذفي أي كود موجود، والصقي كامل هذا الملف.
 *
 *  4. اضغطي Deploy ← New deployment.
 *       - اضغطي ⚙️ بجانب "Select type" واختاري "Web app".
 *       - Description: اكتبي أي شيء.
 *       - Execute as: Me
 *       - Who has access: Anyone   ← مهم جداً
 *       - اضغطي Deploy، ووافقي على الأذونات (Authorize).
 *
 *  5. انسخي رابط الـ "Web app URL" (ينتهي بـ /exec).
 *
 *  6. الصقيه في لوحة التحكم ← القالب والألوان ← "ربط الحجوزات بـ Google Sheets"
 *     ثم اضغطي حفظ.
 *
 *  بعدها كل حجز جديد رح ينحفظ تلقائياً في الجدول. ✓
 * ════════════════════════════════════════════════════════════
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // أضف صف العناوين أول مرة فقط
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'تاريخ الإرسال', 'الاسم', 'الهاتف', 'الإيميل',
        'نوع الجلسة', 'تاريخ الموعد', 'الوقت', 'الرسالة'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    var d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      d.name    || '',
      "'" + (d.phone || ''),   // ' يمنع جوجل من تحويل الرقم لصيغة علمية
      d.email   || '',
      d.type    || '',
      d.date    || '',
      d.time    || '',
      d.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// للاختبار فقط — افتحي الرابط في المتصفح للتأكد أن السكربت يعمل
function doGet() {
  return ContentService.createTextOutput('Hanadi Insights webhook is running ✓');
}
