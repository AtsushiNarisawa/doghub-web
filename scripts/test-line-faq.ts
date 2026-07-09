// LINE FAQ マッチャの決定論的テスト。実コード（src/lib/line-faq.ts）をそのまま実走し、
// 現実的な顧客文面が意図どおりのカテゴリへ落ちるかを検証する。
// 2026-07〜: 自由文は常に fallbackReply＋アラートになるため（webhook/route.ts）、
// matchFaqReply はカテゴリ判定（アラートメールのラベル用）だけを検証する。needsHuman は廃止済み。
// 完全一致（ボタン相当）だけが自動返信・アラートなしになる＝ matchExactButtonReply を別途検証。
// 実行: node scripts/test-line-faq.ts   （Node v23.6+ は .ts を直接実行可能）
import { matchFaqReply, matchExactButtonReply } from "../src/lib/line-faq.ts";

type Case = { text: string; expect: string; note?: string };

// expect は matchFaqReply が返す category 文字列。フォールバックは "フォールバック"。
const CASES: Case[] = [
  // ───── 新規: 対応外サービス（ケア・送迎）→ needsHuman=false ─────
  { text: "トリミングはできますか？", expect: "対応外サービス" },
  { text: "シャンプーだけお願いできますか", expect: "対応外サービス" },
  { text: "シャンプーの料金はいくらですか", expect: "対応外サービス", note: "料金語を含むが対応外が優先" },
  { text: "爪切りやってもらえますか", expect: "対応外サービス" },
  { text: "歯磨きのケアはありますか", expect: "対応外サービス" },
  { text: "耳掃除はしてくれますか", expect: "対応外サービス" },
  { text: "肛門腺絞りはできますか", expect: "対応外サービス" },
  { text: "送迎はありますか？自宅まで来てくれますか", expect: "対応外サービス" },
  { text: "ピックアップサービスはありますか", expect: "対応外サービス" },
  { text: "トリミングの予約をしたいです", expect: "対応外サービス", note: "予約語を含むが対応外が優先" },
  { text: "トリムをお願いしたい", expect: "対応外サービス" },
  // 敵対的テスト由来の言い換え回帰（2026-06-09）
  { text: "預けてる間に毛をカットしてもらえたりしますか?", expect: "対応外サービス", note: "旧:予約へ誤爆" },
  { text: "毛玉がひどいので整えてほしいんですけど対応できますか?", expect: "対応外サービス", note: "旧:取りこぼし" },
  { text: "爪が伸びてるので切ってもらえますか?", expect: "対応外サービス", note: "旧:取りこぼし" },
  { text: "歯石がたまってきたので取ってもらいたいです", expect: "対応外サービス", note: "旧:取りこぼし" },
  { text: "耳が汚れてるみたいなので掃除してもらえると助かります", expect: "対応外サービス", note: "旧:取りこぼし" },
  { text: "お泊まりのついでにお風呂に入れてもらうことってできますか?", expect: "対応外サービス", note: "旧:予約へ誤爆" },
  { text: "体が汚れてるので一回洗ってほしいんですが", expect: "対応外サービス", note: "旧:取りこぼし" },
  { text: "家まで迎えに来てもらうことってできますか?", expect: "対応外サービス", note: "送迎・旧:取りこぼし" },
  { text: "終わったらうちまでお届けってお願いできますか?", expect: "対応外サービス", note: "送迎・旧:取りこぼし" },
  { text: "預ける前にサッとブラッシングしてもらえると嬉しいんですけど", expect: "対応外サービス", note: "旧:予約へ誤爆" },
  { text: "肛門のところ気になるみたいなんですが絞ってもらえますか?", expect: "対応外サービス", note: "旧:取りこぼし" },

  // ───── 新規: 支払い方法 → needsHuman=false ─────
  { text: "支払いはカードできますか", expect: "支払い方法" },
  { text: "お支払い方法を教えてください", expect: "支払い方法" },
  { text: "クレジットカードは使えますか", expect: "支払い方法" },
  { text: "PayPayは使えますか", expect: "支払い方法" },
  { text: "電子マネーで払えますか", expect: "支払い方法" },
  { text: "現金しか使えませんか", expect: "支払い方法" },
  { text: "QR決済に対応していますか", expect: "支払い方法" },
  { text: "カードは使えますか？", expect: "支払い方法", note: "旧:取りこぼし(カード払のみ)" },
  { text: "お会計って何で払えます？", expect: "支払い方法", note: "旧:取りこぼし" },
  { text: "精算方法を教えてください", expect: "支払い方法", note: "旧:取りこぼし" },
  { text: "キャッシュレス可能ですか？", expect: "支払い方法", note: "旧:取りこぼし" },
  { text: "ICカードは使えますか？", expect: "支払い方法", note: "旧:取りこぼし" },

  // ───── 新規: お散歩オプション → needsHuman=false ─────
  { text: "散歩はしてくれますか", expect: "お散歩オプション" },
  { text: "お散歩オプションについて教えて", expect: "お散歩オプション" },
  { text: "預かり中にさんぽに連れて行ってもらえますか", expect: "お散歩オプション" },
  { text: "散歩の予約もできますか", expect: "お散歩オプション", note: "予約語を含むが散歩が優先" },
  { text: "外に連れ出して運動させてもらえませんか", expect: "お散歩オプション", note: "旧:取りこぼし" },
  { text: "預けてる間、ちょっと歩かせてあげることってできますか？", expect: "お散歩オプション", note: "旧:予約へ誤爆" },

  // ───── 新規: 様子確認・ライブカメラ → needsHuman=false ─────
  { text: "預けている間の様子は見られますか", expect: "様子確認" },
  { text: "カメラはありますか", expect: "様子確認" },
  { text: "ライブカメラで確認できますか", expect: "様子確認" },
  { text: "うちの子の様子が心配です", expect: "様子確認" },
  { text: "宿泊中に一度面会に行くことってできますか？顔を見たくて", expect: "様子確認", note: "旧:予約へ誤爆" },
  // 写真・動画の要望は意図的にフォールバック→人間が実際の写真を送る（カメラ案内で逃げない）
  { text: "あずけてる間、写真とか送ってもらえたりしますか？", expect: "フォールバック", note: "写真要望は人間対応が良い" },
  { text: "ホームページの写真めっちゃ可愛いですね〜あのワンちゃん看板犬ですか？", expect: "フォールバック", note: "雑談・写真で誤爆させない" },

  // ───── 既存: 受入確認（最優先・needsHuman）の回帰 ─────
  { text: "猫も預かってもらえますか", expect: "受入確認" },
  { text: "発情中ですが大丈夫ですか", expect: "受入確認" },
  { text: "多頭飼いですが預けられますか", expect: "受入確認" },
  { text: "持病があるのですが", expect: "受入確認" },
  { text: "投薬が必要です", expect: "受入確認" },

  // ───── 既存: キャンセル/変更 ─────
  { text: "予約をキャンセルしたい", expect: "キャンセル/変更" },
  { text: "予約を変更できますか", expect: "キャンセル/変更", note: "予約語を含むが変更優先" },
  { text: "日程変更をお願いします", expect: "キャンセル/変更" },

  // ───── 新規: 到着時間の変更・遅刻（2026-07・長谷部様ケースの再発防止）─────
  { text: "今日車が混んでいて到着が遅れそうです", expect: "到着時間の変更・遅刻" },
  { text: "少し遅刻しそうなのですが大丈夫でしょうか", expect: "到着時間の変更・遅刻" },
  { text: "到着時間を変更したいのですが", expect: "到着時間の変更・遅刻" },
  {
    text: "初めまして。7月25日に9時から予約してます長谷部と申します。予約時間についてお聞きしたいのですが、お預かり時間が9時からになってると思いますが9時半から13時半とかでも大丈夫なんでしょうか？",
    expect: "営業時間",
    note: "実例(2026-07-05)。カテゴリラベルは営業時間のままだが、自由文は常にfallback+アラートになるため実害なし",
  },

  // ───── 既存: 料金 ─────
  { text: "料金はいくらですか", expect: "料金" },
  { text: "1泊おいくらですか", expect: "料金" },
  { text: "宿泊の値段を教えて", expect: "料金", note: "宿泊(予約語)を含むが料金優先" },

  // ───── 既存: ワクチン ─────
  { text: "ワクチンは必要ですか", expect: "ワクチン" },
  { text: "狂犬病の証明書は要りますか", expect: "ワクチン" },

  // ───── 既存: 持ち物 ─────
  { text: "持ち物は何が必要ですか", expect: "持ち物" },
  { text: "用意するものはありますか", expect: "持ち物" },

  // ───── 既存: 大型犬・サイズ ─────
  { text: "大型犬も預けられますか", expect: "大型犬" },
  { text: "体重20キロですが大丈夫ですか", expect: "大型犬" },
  { text: "20kgまで大丈夫ですか", expect: "大型犬" },

  // ───── 既存: 営業時間（"15"誤爆解消の回帰）─────
  { text: "営業時間を教えてください", expect: "営業時間" },
  { text: "何時まで預かってもらえますか", expect: "営業時間" },
  { text: "15時にお迎えに行けますか", expect: "フォールバック", note: "旧誤爆(大型犬)が解消され、人間対応へ回る（許容）" },
  { text: "定休日はいつですか", expect: "営業時間" },

  // ───── 既存: アクセス ─────
  { text: "場所はどこですか", expect: "アクセス" },
  { text: "駐車場はありますか", expect: "アクセス" },
  { text: "パーキングはありますか", expect: "アクセス" },

  // ───── 既存: 予約 ─────
  { text: "予約したいです", expect: "予約" },
  { text: "泊まりで預けたい", expect: "予約" },
  { text: "明日預かってもらえますか", expect: "予約" },

  // ───── フォールバック（FAQ非該当）─────
  { text: "こんにちは", expect: "フォールバック" },
  { text: "ありがとうございました", expect: "フォールバック" },
  { text: "うちの犬はチワワです", expect: "フォールバック" },
  { text: "ペット保険ってどこのがおすすめですか？加入しといた方がいいのかなと", expect: "フォールバック", note: "旧:どこ で住所へ誤爆" },
];

let pass = 0;
const fails: string[] = [];

for (const c of CASES) {
  const { category } = matchFaqReply(c.text);
  if (category === c.expect) {
    pass++;
  } else {
    fails.push(`✗ "${c.text}" → 期待=${c.expect} 実際=${category}${c.note ? `  〈${c.note}〉` : ""}`);
  }
}

console.log(`\nLINE FAQ マッチャ テスト: ${pass}/${CASES.length} PASS\n`);
if (fails.length) {
  console.log(fails.join("\n"));
  console.log(`\n❌ ${fails.length} 件 FAIL`);
  process.exit(1);
} else {
  console.log("✅ 全ケース PASS（カテゴリ判定は意図どおり）");
}

// ───── matchExactButtonReply（ボタン相当＝完全一致のみ自動返信・アラートなし）─────
type ExactCase = { text: string; expectMatch: boolean; note?: string };

const EXACT_CASES: ExactCase[] = [
  // リッチメニューの6ボタンと完全一致 → 自動返信対象
  { text: "料金", expectMatch: true },
  { text: "アクセス", expectMatch: true },
  { text: "営業時間", expectMatch: true },
  { text: "持ち物", expectMatch: true },
  { text: "支払い方法", expectMatch: true, note: "categoryとキーワードが別語のため直接一致も要確認" },
  { text: "到着時間の変更・遅刻", expectMatch: true },
  // ボタンのキーワード同義語も完全一致なら対象（例: 手打ちで「いくら」とだけ送った場合）
  { text: "いくら", expectMatch: true },
  { text: "駐車", expectMatch: true },
  // 文章の一部にキーワードを含むだけ（完全一致でない）→ 対象外（スタッフ対応へ）
  { text: "料金を教えてください", expectMatch: false },
  { text: "予約時間についてお聞きしたいのですが、9時半から13時半とかでも大丈夫なんでしょうか？", expectMatch: false, note: "長谷部様の実例" },
  // 受入確認・キャンセル/変更・予約など「個別判断が必要」なカテゴリは、完全一致でも対象外
  { text: "猫", expectMatch: false, note: "受入確認は完全一致でも常にスタッフ対応" },
  { text: "キャンセル", expectMatch: false, note: "キャンセル/変更は完全一致でも常にスタッフ対応" },
  { text: "予約", expectMatch: false, note: "予約はbuttonExact対象外＝常にスタッフ対応" },
  { text: "こんにちは", expectMatch: false },
];

let exactPass = 0;
const exactFails: string[] = [];

for (const c of EXACT_CASES) {
  const matched = !!matchExactButtonReply(c.text);
  if (matched === c.expectMatch) {
    exactPass++;
  } else {
    exactFails.push(
      `✗ "${c.text}" → 期待=${c.expectMatch ? "自動返信" : "スタッフ対応"} 実際=${matched ? "自動返信" : "スタッフ対応"}${c.note ? `  〈${c.note}〉` : ""}`
    );
  }
}

console.log(`\nmatchExactButtonReply テスト: ${exactPass}/${EXACT_CASES.length} PASS\n`);
if (exactFails.length) {
  console.log(exactFails.join("\n"));
  console.log(`\n❌ ${exactFails.length} 件 FAIL`);
  process.exit(1);
} else {
  console.log("✅ 全ケース PASS（完全一致判定は意図どおり）");
}
