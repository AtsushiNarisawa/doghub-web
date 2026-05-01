import nodemailer from "nodemailer";
import type { BookingFormData } from "@/types/booking";
import { PLANS } from "@/types/booking";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり（1時間〜）",
  "4h": "半日お預かり（4時間）",
  "8h": "1日お預かり（8時間）",
  stay: "宿泊お預かり",
};

function formatDate(d: string) {
  if (!d) return "";
  const date = new Date(d);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
}

function buildCustomerEmailHtml(form: BookingFormData, reservationId: string, status: string): string {
  const isPending = status === "pending";
  const plan = PLANS.find((p) => p.id === form.plan);
  const stayNights =
    form.plan === "stay" && form.checkout_date && form.date
      ? Math.max(1, Math.round((new Date(form.checkout_date).getTime() - new Date(form.date).getTime()) / 86400000))
      : 0;

  const dogsHtml = form.dogs.map((dog) => {
    const ageStr = dog.age === "0" && dog.age_months ? `${dog.age_months}ヶ月` : dog.age ? `${dog.age}歳` : "";
    return `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #f0ebe5;">
        <strong>${dog.name}</strong>（${dog.breed}）
        <span style="color:#888;font-size:13px;"> ${dog.weight}kg${ageStr ? ` / ${ageStr}` : ""}${dog.sex === "male" ? " / オス" : dog.sex === "female" ? " / メス" : ""}</span>
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;">

  <!-- ヘッダー -->
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#3C200F;border-radius:10px;padding:10px 24px;">
      <span style="color:white;font-size:20px;font-weight:700;letter-spacing:2px;">DogHub</span>
    </div>
    <p style="color:#8F7B65;font-size:13px;margin:8px 0 0;">箱根仙石原</p>
  </div>

  <!-- メインカード -->
  <div style="background:white;border-radius:16px;padding:28px 24px;margin-bottom:16px;">
    ${isPending ? `
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;color:#c2410c;font-size:14px;font-weight:600;">&#9888; 仮予約（スタッフ確認中）</p>
      <p style="margin:6px 0 0;color:#c2410c;font-size:13px;">スタッフが確認後にご予約を確定いたします。翌朝9時までにメールにてご連絡いたします。</p>
    </div>` : `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">&#10003; ご予約を承りました</p>
    </div>`}

    <h1 style="font-size:18px;font-weight:600;color:#3C200F;margin:0 0 20px;">
      ${form.customer.last_name} ${form.customer.first_name} 様
    </h1>

    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;width:100px;">プラン</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${PLAN_NAMES[form.plan] || form.plan}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">チェックイン</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${formatDate(form.date)} ${form.checkin_time}</td>
      </tr>
      ${form.plan === "stay" && form.checkout_date ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">チェックアウト</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${formatDate(form.checkout_date)}（${stayNights}泊） / 9:00〜11:00</td>
      </tr>` : ""}
      ${form.early_morning ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;"></td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:13px;color:#B87942;">早朝プラン（7:00〜）</td>
      </tr>` : ""}
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">基本料金</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">¥${((plan?.basePrice ?? 0) * form.dogs.length * Math.max(stayNights || 1, 1)).toLocaleString()}〜</td>
      </tr>
      ${form.walk_option ? `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">散歩オプション</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">あり（¥550/1回1頭）</td>
      </tr>` : ""}
    </table>

    <h3 style="font-size:14px;color:#888;margin:20px 0 10px;">ワンちゃん情報</h3>
    <table style="width:100%;border-collapse:collapse;">
      ${dogsHtml}
    </table>

    <div style="margin-top:20px;background:#f7f5f0;border-radius:10px;padding:14px 16px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#3C200F;">ご来店時のお願い</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#888;font-size:13px;line-height:1.8;">
        <li>ワクチン証明書（狂犬病・混合）をご持参ください</li>
        <li>本人確認できるもの（免許証等）をご持参ください</li>
        <li>お支払いは現地にて（現金・カード・各種電子マネー・QR決済対応）</li>
        <li>引き取り最終時間は17:00です（超過¥1,100/時間）</li>
      </ul>
      <div style="margin-top:10px;display:flex;gap:16px;">
        <a href="https://dog-hub.shop/booking/modify/${reservationId}" style="color:#B87942;font-size:13px;">予約内容を変更する</a>
        <a href="https://dog-hub.shop/booking/cancel/${reservationId}" style="color:#888;font-size:13px;">予約をキャンセルする</a>
      </div>
    </div>

    <!-- 箱根での過ごし方 -->
    <div style="margin-top:16px;background:#f7f5f0;border-radius:10px;padding:14px 16px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#3C200F;">箱根での過ごし方</p>
      <p style="margin:0 0 10px;font-size:12px;color:#888;">ご旅行の参考にどうぞ</p>
      <p style="margin:0 0 6px;font-size:13px;line-height:1.8;">
        <a href="https://dog-hub.shop/news/hakone-dog-trip-guide" style="color:#B87942;text-decoration:none;">▸ 犬連れ旅行ガイド</a>
      </p>
      <p style="margin:0 0 6px;font-size:13px;line-height:1.8;">
        <a href="https://dog-hub.shop/news/hakone-dog-lunch-guide" style="color:#B87942;text-decoration:none;">▸ 犬連れランチ情報</a>
      </p>
      <p style="margin:0;font-size:13px;line-height:1.8;">
        <a href="https://dog-hub.shop/spots" style="color:#B87942;text-decoration:none;">▸ 箱根の観光スポット</a>
      </p>
    </div>

    <!-- はじめてガイド -->
    <div style="margin-top:16px;text-align:center;">
      <a href="https://dog-hub.shop/guide" style="display:inline-block;padding:12px 24px;background:#B87942;color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        はじめてガイドを見る
      </a>
      <p style="margin:8px 0 0;font-size:12px;color:#888;">初めてのご利用の方はぜひご確認ください</p>
    </div>

    ${form.notes ? `
    <div style="margin-top:16px;padding:12px 14px;border:1px solid #f0ebe5;border-radius:8px;">
      <p style="margin:0 0 4px;font-size:12px;color:#888;">備考</p>
      <p style="margin:0;font-size:13px;color:#3C200F;">${form.notes}</p>
    </div>` : ""}
  </div>

  <!-- フッター -->
  <div style="text-align:center;padding:16px 0;">
    <p style="margin:0 0 4px;font-size:13px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">神奈川県足柄下郡箱根町仙石原928-15</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">TEL: <a href="tel:0460800290" style="color:#B87942;">0460-80-0290</a></p>
    <p style="margin:0;font-size:12px;color:#888;">営業時間: 金〜火 9:00〜17:00（水・木定休）</p>
    <p style="margin:12px 0 0;font-size:11px;color:#bbb;">予約番号: ${reservationId.slice(0, 8).toUpperCase()}</p>
  </div>
</div>
</body>
</html>`;
}

function buildStaffEmailHtml(form: BookingFormData, reservationId: string, status: string, duplicateWarnings?: string[]): string {
  const isPending = status === "pending";
  const stayNights =
    form.plan === "stay" && form.checkout_date && form.date
      ? Math.max(1, Math.round((new Date(form.checkout_date).getTime() - new Date(form.date).getTime()) / 86400000))
      : 0;
  const dupSection = duplicateWarnings && duplicateWarnings.length > 0
    ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px;margin:16px 0;color:#c2410c;font-size:13px;">
    <strong>⚠️ 重複登録の自動統合</strong>
    <ul style="margin:8px 0 0;padding-left:20px;">
      ${duplicateWarnings.map((w) => `<li>${w}</li>`).join("")}
    </ul>
    <p style="margin:8px 0 0;font-size:12px;color:#9a3412;">既存の犬情報に予約が紐付けられました。問題があれば管理画面でご確認ください。</p>
  </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;padding:20px;background:#f7f5f0;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:24px;">

  <h2 style="margin:0 0 16px;font-size:18px;color:${isPending ? "#c2410c" : "#15803d"};">
    ${isPending ? "⚠️ 新規予約（要確認）" : "✅ 新規予約が入りました"}
  </h2>

  ${isPending ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px;margin-bottom:16px;color:#c2410c;font-size:13px;">仮予約です。管理画面で確認し「確定」に変更してください。確定時にお客様へ自動でメールが送信されます。</div>` : ""}

  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 0;color:#888;width:110px;">予約番号</td><td style="padding:6px 0;">${reservationId.slice(0, 8).toUpperCase()}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">プラン</td><td style="padding:6px 0;">${PLAN_NAMES[form.plan] || form.plan}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">日付</td><td style="padding:6px 0;">${formatDate(form.date)} ${form.checkin_time}〜${form.plan === "stay" ? `（${stayNights}泊 / CO: ${formatDate(form.checkout_date || "")}）` : ""}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">お客様</td><td style="padding:6px 0;">${form.customer.last_name} ${form.customer.first_name}（${form.customer.last_name_kana} ${form.customer.first_name_kana}）</td></tr>
    <tr><td style="padding:6px 0;color:#888;">電話</td><td style="padding:6px 0;"><a href="tel:${form.customer.phone}" style="color:#B87942;">${form.customer.phone}</a></td></tr>
    <tr><td style="padding:6px 0;color:#888;">メール</td><td style="padding:6px 0;">${form.customer.email}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">行き先</td><td style="padding:6px 0;">${form.destination || "—"}</td></tr>
    <tr><td style="padding:6px 0;color:#888;">きっかけ</td><td style="padding:6px 0;">${form.referral_source || "—"}</td></tr>
    ${form.walk_option ? `<tr><td style="padding:6px 0;color:#888;">散歩</td><td style="padding:6px 0;color:#B87942;">あり</td></tr>` : ""}
    ${form.notes ? `<tr><td style="padding:6px 0;color:#888;">備考</td><td style="padding:6px 0;">${form.notes}</td></tr>` : ""}
  </table>

  ${dupSection}

  <h3 style="margin:20px 0 10px;font-size:14px;color:#888;">ワンちゃん</h3>
  ${form.dogs.map((dog) => `
  <div style="background:#f7f5f0;border-radius:8px;padding:12px;margin-bottom:8px;font-size:13px;">
    <strong>${dog.name}</strong>（${dog.breed}）
    ${parseFloat(dog.weight) >= 15 ? `<span style="color:#c2410c;font-weight:600;"> ⚠️ ${dog.weight}kg</span>` : ` ${dog.weight}kg`}
    / ${dog.age === "0" && dog.age_months ? `${dog.age_months}ヶ月` : dog.age ? `${dog.age}歳` : ""}${dog.sex === "male" ? " / オス" : dog.sex === "female" ? " / メス" : ""}
    / 狂犬病: ${dog.has_rabies_vaccine ? "接種済" : "未接種"} / 混合: ${dog.has_mixed_vaccine ? "接種済" : "未接種"}
    ${dog.allergies ? `<br><span style="color:#888;">アレルギー: ${dog.allergies}</span>` : ""}
    ${dog.meal_notes ? `<br><span style="color:#888;">食事: ${dog.meal_notes}</span>` : ""}
    ${dog.medication_notes ? `<br><span style="color:#888;">投薬: ${dog.medication_notes}</span>` : ""}
  </div>`).join("")}

  <div style="margin-top:16px;text-align:center;">
    <a href="https://dog-hub.shop/admin/reservations/${reservationId}" style="display:inline-block;padding:12px 24px;background:#B87942;color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">管理画面で確認する</a>
  </div>
</div>
</body>
</html>`;
}

export async function sendBookingEmails(
  form: BookingFormData,
  reservationId: string,
  status: string,
  duplicateWarnings?: string[]
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Email not configured: GMAIL_USER or GMAIL_APP_PASSWORD missing");
    return;
  }

  const isPending = status === "pending";
  const hasDup = duplicateWarnings && duplicateWarnings.length > 0;
  const customerSubject = isPending
    ? `【DogHub箱根】予約リクエストを受け付けました（${formatDate(form.date)}）`
    : `【DogHub箱根】ご予約ありがとうございます（${formatDate(form.date)}）`;

  const staffSubjectBase = isPending
    ? `【要確認】新規予約 ${form.customer.last_name}様 ${formatDate(form.date)}`
    : `【新規予約】${form.customer.last_name}様 ${formatDate(form.date)} ${form.checkin_time}`;
  const staffSubject = hasDup ? `${staffSubjectBase}[重複統合]` : staffSubjectBase;

  const results = await Promise.allSettled([
    // お客様への確認メール
    transporter.sendMail({
      from: `"DogHub箱根仙石原" <narisawa@dog-hub.shop>`,
      replyTo: "info@dog-hub.shop",
      to: form.customer.email,
      subject: customerSubject,
      html: buildCustomerEmailHtml(form, reservationId, status),
    }),
    // スタッフへの通知メール（オーナー）
    transporter.sendMail({
      from: `"DogHub予約システム" <narisawa@dog-hub.shop>`,
      to: "narisawa@dog-hub.shop",
      subject: staffSubject,
      html: buildStaffEmailHtml(form, reservationId, status, duplicateWarnings),
    }),
    // スタッフへの通知メール（スタッフ）
    transporter.sendMail({
      from: `"DogHub予約システム" <narisawa@dog-hub.shop>`,
      to: "koi02121957@gmail.com",
      subject: staffSubject,
      html: buildStaffEmailHtml(form, reservationId, status, duplicateWarnings),
    }),
  ]);

  const destinations = [form.customer.email, "narisawa@dog-hub.shop", "koi02121957@gmail.com"];
  const labels = ["customer", "staff-owner", "staff-member"];
  results.forEach((result, i) => {
    const label = labels[i] || `mail-${i}`;
    if (result.status === "rejected") {
      const err = result.reason as Error & { code?: string; responseCode?: number; response?: string };
      console.error(`[email] FAILED [${label}] to=${destinations[i]} reservation=${reservationId} code=${err.code} message=${err.message?.slice(0, 300)}`);
    } else {
      console.log(`[email] OK [${label}] to=${destinations[i]} reservation=${reservationId}`);
    }
  });

  // お客様向けメール（i=0）が失敗した場合は throw して呼び出し元に通知
  // スタッフメール失敗はログのみ（業務影響なし）
  const customerResult = results[0];
  if (customerResult.status === "rejected") {
    const err = customerResult.reason as Error;
    throw new Error(`お客様メール送信失敗: ${err.message?.slice(0, 200)}`);
  }
}

// ──────────────────────────────────────────
// お礼メール（利用完了後に送信）
// ──────────────────────────────────────────

const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJZ4GCMaOfGWAR9WTxcF0Jkpk";

function buildThankYouEmailHtml(
  customerName: string,
  dogNames: string[],
  planName: string,
  isFirstVisit: boolean,
): string {
  const reviewSection = isFirstVisit
    ? `
    <div style="margin:24px 0;padding:20px;background:#F8F5F0;border-radius:12px;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;color:#3C200F;font-weight:600;">よろしければ、ご感想をお聞かせください</p>
      <p style="margin:0 0 16px;font-size:13px;color:#888;">皆さまの声が私たちの励みになります</p>
      <a href="${GOOGLE_REVIEW_URL}" style="display:inline-block;padding:12px 32px;background:#B87942;color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">Googleで口コミを書く</a>
      <p style="margin:8px 0 0;font-size:11px;color:#bbb;">1分で完了します</p>
    </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<body style="margin:0;padding:0;background:#F7F7F7;font-family:'Helvetica Neue',Arial,'Hiragino Sans',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 16px;">

  <!-- ヘッダー -->
  <div style="text-align:center;padding:24px 0 16px;">
    <p style="margin:0;font-size:20px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
  </div>

  <!-- メインカード -->
  <div style="background:white;border-radius:16px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

    <p style="margin:0 0 24px;font-size:15px;color:#3C200F;line-height:2;">
      ${customerName} 様
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#3C200F;line-height:2;">
      先日はDogHub箱根仙石原にお越しいただき、ありがとうございました。わんちゃんとの箱根旅行はいかがでしたか？
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#3C200F;line-height:2;">
      看板犬のポロ・ぱんち・ムックともども、またお会いできるのを楽しみにしています。
    </p>

    ${reviewSection}

    <!-- 次回予約 -->
    <div style="margin:20px 0;text-align:center;">
      <a href="https://dog-hub.shop/booking" style="display:inline-block;padding:12px 32px;border:1px solid #B87942;color:#B87942;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">次回のご予約はこちら</a>
    </div>
  </div>

  <!-- フッター -->
  <div style="text-align:center;padding:20px 0;">
    <p style="margin:0 0 4px;font-size:13px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">神奈川県足柄下郡箱根町仙石原928-15</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">TEL: <a href="tel:0460800290" style="color:#B87942;">0460-80-0290</a></p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">営業時間: 金〜火 9:00〜17:00（水・木定休）</p>
    <p style="margin:12px 0 0;">
      <a href="https://www.instagram.com/doghub.hakone__/" style="color:#B87942;font-size:12px;text-decoration:none;">Instagram: @doghub.hakone__</a>
    </p>
  </div>

</div>
</body>
</html>`;
}

export async function sendThankYouEmail(
  email: string,
  customerName: string,
  dogNames: string[],
  planName: string,
  isFirstVisit: boolean,
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Email not configured");
    return;
  }

  const subject = "ご利用ありがとうございました｜DogHub箱根仙石原";

  try {
    await transporter.sendMail({
      from: `"DogHub箱根仙石原" <narisawa@dog-hub.shop>`,
      replyTo: "info@dog-hub.shop",
      to: email,
      subject,
      html: buildThankYouEmailHtml(customerName, dogNames, planName, isFirstVisit),
    });
    console.log(`Thank-you email sent to ${email}`);
  } catch (err) {
    console.error("Thank-you email failed:", err);
  }
}

// ──────────────────────────────────────────
// 確認メール再送（DBの予約データから直接送信）
// ──────────────────────────────────────────
export async function resendConfirmationEmail(
  reservation: {
    id: string;
    plan: string;
    date: string;
    checkin_time: string;
    checkout_date: string | null;
    status: string;
    walk_option: boolean;
    destination: string | null;
    notes: string | null;
  },
  customer: {
    last_name: string;
    first_name: string;
    email: string;
  },
  dogList: { name: string; breed: string; weight: number }[],
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  // BookingFormDataに変換してbuildCustomerEmailHtmlを再利用
  const form: BookingFormData = {
    plan: reservation.plan as "spot" | "4h" | "8h" | "stay",
    date: reservation.date,
    checkin_time: reservation.checkin_time?.slice(0, 5) || "",
    checkout_date: reservation.checkout_date || "",
    checkin_extension: false,
    checkin_extension_from: "",
    checkout_extension: false,
    checkout_extension_until: "",
    early_morning: false,
    walk_option: reservation.walk_option,
    destination: reservation.destination || "",
    referral_source: "",
    agreed: true,
    notes: reservation.notes || "",
    dogs: dogList.map((d) => ({
      name: d.name,
      breed: d.breed,
      weight: String(d.weight),
      age: "",
      age_months: "",
      sex: "male" as const,
      has_rabies_vaccine: false,
      has_mixed_vaccine: false,
      allergies: "",
      meal_notes: "",
      medication_notes: "",
      rabies_vaccine_status: "" as const,
      mixed_vaccine_status: "" as const,
      vaccine_unable_reason: "",
    })),
    customer: {
      last_name: customer.last_name,
      first_name: customer.first_name || "",
      last_name_kana: "",
      first_name_kana: "",
      phone: "",
      email: customer.email,
      postal_code: "",
      address: "",
    },
  };

  const html = buildCustomerEmailHtml(form, reservation.id, reservation.status);
  const dateStr = formatDate(reservation.date);
  const subject = reservation.status === "confirmed"
    ? `【DogHub箱根】ご予約確認（${dateStr}）`
    : `【DogHub箱根】予約リクエストを受け付けました（${dateStr}）`;

  await transporter.sendMail({
    from: `"DogHub箱根仙石原" <${process.env.GMAIL_USER}>`,
    replyTo: "info@dog-hub.shop",
    to: customer.email,
    subject,
    html,
  });
}

// ──────────────────────────────────────────
// カスタムメッセージ送信（管理画面から自由文で返信）
// ──────────────────────────────────────────
function buildCustomMessageHtml(
  customerName: string,
  bodyText: string,
  reservation: {
    id: string;
    plan: string;
    date: string;
    checkin_time: string;
    checkout_date: string | null;
  },
  dogNames: string[],
): string {
  // プレーンテキストの本文をHTMLに変換（改行を <br>、HTML特殊文字をエスケープ）
  const escaped = bodyText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const bodyHtml = escaped.replace(/\r?\n/g, "<br>");

  const planName = PLAN_NAMES[reservation.plan] || reservation.plan;
  const stayNights =
    reservation.plan === "stay" && reservation.checkout_date && reservation.date
      ? Math.max(1, Math.round((new Date(reservation.checkout_date).getTime() - new Date(reservation.date).getTime()) / 86400000))
      : 0;
  const checkinTime = reservation.checkin_time?.slice(0, 5) || "";

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,'Hiragino Sans',sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;">

  <!-- ヘッダー -->
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#3C200F;border-radius:10px;padding:10px 24px;">
      <span style="color:white;font-size:20px;font-weight:700;letter-spacing:2px;">DogHub</span>
    </div>
    <p style="color:#8F7B65;font-size:13px;margin:8px 0 0;">箱根仙石原</p>
  </div>

  <!-- メッセージ本文 -->
  <div style="background:white;border-radius:16px;padding:28px 24px;margin-bottom:16px;">
    <p style="margin:0 0 20px;font-size:15px;color:#3C200F;line-height:1.9;">
      ${bodyHtml}
    </p>

    <!-- ご予約内容 -->
    <div style="margin-top:24px;padding:16px;background:#f7f5f0;border-radius:10px;">
      <p style="margin:0 0 10px;font-size:12px;color:#888;font-weight:600;">ご予約内容</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr>
          <td style="padding:4px 0;color:#888;width:90px;">プラン</td>
          <td style="padding:4px 0;color:#3C200F;">${planName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">日付</td>
          <td style="padding:4px 0;color:#3C200F;">${formatDate(reservation.date)}${checkinTime ? ` ${checkinTime}〜` : ""}</td>
        </tr>
        ${reservation.checkout_date ? `
        <tr>
          <td style="padding:4px 0;color:#888;">チェックアウト</td>
          <td style="padding:4px 0;color:#3C200F;">${formatDate(reservation.checkout_date)}${stayNights > 1 ? `（${stayNights}泊）` : ""}</td>
        </tr>` : ""}
        ${dogNames.length > 0 ? `
        <tr>
          <td style="padding:4px 0;color:#888;">ワンちゃん</td>
          <td style="padding:4px 0;color:#3C200F;">${dogNames.join("、")}</td>
        </tr>` : ""}
      </table>
    </div>

    <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.8;">
      ご不明点がございましたら、このメールにそのまま返信いただくか、お電話（<a href="tel:0460800290" style="color:#B87942;text-decoration:none;">0460-80-0290</a>）までお気軽にお問い合わせください。
    </p>
  </div>

  <!-- フッター -->
  <div style="text-align:center;padding:16px 0;">
    <p style="margin:0 0 4px;font-size:13px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">神奈川県足柄下郡箱根町仙石原928-15</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">TEL: <a href="tel:0460800290" style="color:#B87942;">0460-80-0290</a></p>
    <p style="margin:0;font-size:12px;color:#888;">営業時間: 金〜火 9:00〜17:00（水・木定休）</p>
    <p style="margin:12px 0 0;font-size:11px;color:#bbb;">予約番号: ${reservation.id.slice(0, 8).toUpperCase()}</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendCustomMessage(params: {
  to: string;
  subject: string;
  body: string;
  customerName: string;
  reservation: {
    id: string;
    plan: string;
    date: string;
    checkin_time: string;
    checkout_date: string | null;
  };
  dogNames: string[];
}): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmailの設定がされていません");
  }

  const html = buildCustomMessageHtml(
    params.customerName,
    params.body,
    params.reservation,
    params.dogNames,
  );

  await transporter.sendMail({
    from: `"DogHub箱根仙石原" <${process.env.GMAIL_USER}>`,
    replyTo: "info@dog-hub.shop",
    to: params.to,
    subject: params.subject,
    html,
    text: params.body, // プレーンテキスト版も付与
  });
}

// ──────────────────────────────────────────
// キャンセル通知メール（お客様 + スタッフ）
// お客様からのキャンセル / スタッフからのキャンセル両方で使用
// ──────────────────────────────────────────
export async function sendCancellationEmails(params: {
  reservationId: string;
  reservation: {
    plan: string;
    date: string;
    checkin_time: string;
    checkout_date: string | null;
  };
  customer: {
    last_name: string;
    first_name: string;
    phone: string;
    email: string;
  } | null;
  dogCount: number;
  cancelReason: string | null;
  cancelledBy: "customer" | "staff";
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const PLAN_NAMES_LOCAL: Record<string, string> = {
    spot: "スポット利用", "4h": "半日お預かり", "8h": "1日お預かり", stay: "宿泊お預かり",
  };
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const d = new Date(params.reservation.date);
  const dateStr = `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`;
  const checkinTime = params.reservation.checkin_time?.slice(0, 5) || "";
  const planName = PLAN_NAMES_LOCAL[params.reservation.plan] || params.reservation.plan;
  const { customer } = params;

  const emails: Promise<unknown>[] = [];

  // お客様へのキャンセル完了メール
  if (customer?.email) {
    const staffNote = params.cancelledBy === "staff"
      ? `<p style="margin:0 0 16px;font-size:14px;color:#3C200F;line-height:1.7;">
           本予約はDogHub箱根仙石原のスタッフ操作によりキャンセルとなりました。<br>
           お心当たりがない場合はお手数ですがご連絡ください。
         </p>`
      : "";

    emails.push(
      transporter.sendMail({
        from: `"DogHub箱根仙石原" <narisawa@dog-hub.shop>`,
        replyTo: "info@dog-hub.shop",
        to: customer.email,
        subject: `【DogHub箱根】ご予約キャンセルのご確認(${dateStr})`,
        html: `<!DOCTYPE html>
<html lang="ja">
<body style="margin:0;padding:0;background:#F7F7F7;font-family:'Helvetica Neue',Arial,'Hiragino Sans',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 16px;">
  <div style="text-align:center;padding:24px 0 16px;">
    <p style="margin:0;font-size:20px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
  </div>
  <div style="background:white;border-radius:16px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <p style="margin:0 0 20px;font-size:15px;color:#3C200F;line-height:1.8;">
      ${customer.last_name}${customer.first_name || ""} 様<br><br>
      以下のご予約のキャンセルを承りました。
    </p>
    <div style="padding:16px;background:#F8F5F0;border-radius:10px;margin:0 0 20px;">
      <table style="font-size:14px;color:#3C200F;border-collapse:collapse;width:100%;">
        <tr><td style="padding:4px 12px 4px 0;color:#888;">プラン</td><td>${planName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">日程</td><td>${dateStr} ${checkinTime}</td></tr>
        ${params.reservation.checkout_date ? `<tr><td style="padding:4px 12px 4px 0;color:#888;">チェックアウト</td><td>${new Date(params.reservation.checkout_date).getMonth() + 1}/${new Date(params.reservation.checkout_date).getDate()}</td></tr>` : ""}
      </table>
    </div>
    ${staffNote}
    <p style="margin:0 0 20px;font-size:14px;color:#888;line-height:1.7;">
      またのご利用をお待ちしております。<br>
      ご不明な点がございましたらお気軽にご連絡ください。
    </p>
    <div style="text-align:center;">
      <a href="https://dog-hub.shop/booking" style="display:inline-block;padding:12px 32px;border:1px solid #B87942;color:#B87942;border-radius:8px;text-decoration:none;font-size:14px;">再度ご予約はこちら</a>
    </div>
  </div>
  <div style="text-align:center;padding:20px 0;">
    <p style="margin:0 0 4px;font-size:13px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">神奈川県足柄下郡箱根町仙石原928-15</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">TEL: <a href="tel:0460800290" style="color:#B87942;">0460-80-0290</a></p>
    <p style="margin:0;font-size:12px;color:#888;">営業時間: 金〜火 9:00〜17:00(水・木定休)</p>
  </div>
</div>
</body>
</html>`,
      })
    );
  }

  // スタッフへのキャンセル通知メール
  const sourceLabel = params.cancelledBy === "staff" ? "スタッフ操作" : "お客様";
  const cancelStaffSubject = `【キャンセル】${customer?.last_name || ""}様 ${dateStr} ${checkinTime} ${params.dogCount}頭`;
  const cancelStaffHtml = `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
      <h2 style="color:#c2410c;">予約がキャンセルされました</h2>
      <table style="font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 12px 6px 0;color:#888;">操作元</td><td>${sourceLabel}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#888;">お客様</td><td>${customer?.last_name || ""} ${customer?.first_name || ""}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#888;">電話</td><td>${customer?.phone || ""}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#888;">プラン</td><td>${planName}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#888;">日程</td><td>${dateStr} ${checkinTime}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#888;">頭数</td><td>${params.dogCount}頭</td></tr>
        ${params.cancelReason ? `<tr><td style="padding:6px 12px 6px 0;color:#888;">理由</td><td>${params.cancelReason}</td></tr>` : ""}
      </table>
      <p style="margin-top:16px;"><a href="https://dog-hub.shop/admin/reservations/${params.reservationId}" style="color:#B87942;">管理画面で確認する</a></p>
    </div>`;

  // オーナー
  emails.push(
    transporter.sendMail({
      from: `"DogHub予約システム" <narisawa@dog-hub.shop>`,
      to: "narisawa@dog-hub.shop",
      subject: cancelStaffSubject,
      html: cancelStaffHtml,
    })
  );
  // スタッフ
  emails.push(
    transporter.sendMail({
      from: `"DogHub予約システム" <narisawa@dog-hub.shop>`,
      to: "koi02121957@gmail.com",
      subject: cancelStaffSubject,
      html: cancelStaffHtml,
    })
  );

  await Promise.allSettled(emails);
}
