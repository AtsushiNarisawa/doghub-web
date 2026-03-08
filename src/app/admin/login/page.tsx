"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
    } else {
      router.replace("/admin");
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-sm"
      >
        <div className="text-center">
          <h1 className="text-xl font-medium text-gray-900">DogHub 管理画面</h1>
          <p className="text-sm text-gray-500 mt-1">スタッフログイン</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div>
          <label className="text-sm text-gray-600 block mb-1">メールアドレス</label>
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 text-base focus:border-[#B87942] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 text-base focus:border-[#B87942] focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#B87942] text-white font-medium active:bg-[#A06830] disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
