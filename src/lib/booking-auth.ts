// 公開キャンセル/変更ページの本人確認（電話番号の下4桁照合）。
// 予約UUIDだけで第三者が予約のPII閲覧・キャンセル・変更できる問題（IDOR）への対策。
// トークン方式（URLに秘密文字列）はご高齢のお客様には不向きなため、
// 「お客様が必ず知っている情報＝電話番号の下4桁」を簡易second-factorとして照合する。

/** 電話番号文字列から数字のみ抽出し下4桁を返す */
export function phoneLast4(phone: string | null | undefined): string {
  return (phone || "").replace(/\D/g, "").slice(-4);
}

/** 入力された下4桁が予約者の電話番号下4桁と一致するか */
export function verifyPhoneLast4(
  phone: string | null | undefined,
  input: string | null | undefined
): boolean {
  const expected = phoneLast4(phone);
  const given = (input || "").replace(/\D/g, "").slice(-4);
  return expected.length === 4 && expected === given;
}
