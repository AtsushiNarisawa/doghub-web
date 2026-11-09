import { supabase } from "@/lib/supabase";

// 管理画面から本人確認付きで API を呼ぶ。
// 401 は API が処理を始める前に断った応答なので、ログインを更新して1回だけ再送しても
// 予約の変更やメール送信が二重になることはない。

function send(url: string, init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/refresh", { method: "POST" });
    if (!res.ok) return null;
    const json = await res.json().catch(() => ({}));
    const accessToken = json?.session?.access_token;
    const refreshToken = json?.session?.refresh_token;
    if (!accessToken || !refreshToken) return null;
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    return accessToken;
  } catch {
    return null;
  }
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const res = await send(url, init, data.session?.access_token ?? null);
  if (res.status !== 401) return res;

  const freshToken = await refreshAccessToken();
  return freshToken ? send(url, init, freshToken) : res;
}
