"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import liff from "@line/liff";
import type { BookingStep, BookingFormData } from "@/types/booking";
import { INITIAL_FORM } from "@/types/booking";
import { StepIndicator } from "@/components/booking/step-indicator";
import { Step1Plan } from "@/components/booking/step1-plan";
import { Step2Dogs } from "@/components/booking/step2-dogs";
import { Step3Customer } from "@/components/booking/step3-customer";
import { Step4Confirm } from "@/components/booking/step4-confirm";

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";

function pushEvent(event: string, params?: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>(1);
  const [form, setForm] = useState<BookingFormData>({ ...INITIAL_FORM });
  const [result, setResult] = useState<"success" | "success_no_email" | "error" | null>(null);
  const [isLiff, setIsLiff] = useState(false);
  const [editingFromConfirm, setEditingFromConfirm] = useState(false);

  // LIFF初期化 + LINE ID取得
  useEffect(() => {
    pushEvent("begin_booking");

    if (!LIFF_ID) return;

    liff.init({ liffId: LIFF_ID }).then(() => {
      if (liff.isInClient() || liff.isLoggedIn()) {
        setIsLiff(true);
        liff.getProfile().then((profile) => {
          setForm((prev) => ({
            ...prev,
            line_id: profile.userId,
            source: "line" as const,
          }));
        }).catch((e) => {
          console.error("LIFF getProfile error:", e);
          // プロフィール取得に失敗してもLINE内であることは認識
          setIsLiff(true);
        });
      }
    }).catch((e) => {
      console.error("LIFF init error:", e);
    });
  }, []);

  const goNext = () => {
    const nextStep = Math.min(step + 1, 4) as BookingStep;
    pushEvent("booking_step", { booking_step: nextStep });
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1) as BookingStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [errorDetail, setErrorDetail] = useState("");

  const handleSubmit = async () => {
    pushEvent("booking_submit", { plan: form.plan, dog_count: form.dogs.length });
    setErrorDetail("");
    try {
      const apiUrl = typeof window !== "undefined" && window.location.hostname !== "dog-hub.shop"
        ? "https://dog-hub.shop/api/booking"
        : "/api/booking";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        pushEvent("booking_complete", {
          plan: form.plan,
          dog_count: form.dogs.length,
          date: form.date,
        });
        setResult(data.email_failed ? "success_no_email" : "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        pushEvent("booking_error", { error_type: "api_error" });
        setErrorDetail(errData.error || `エラー（${res.status}）`);
        setResult("error");
      }
    } catch (e) {
      pushEvent("booking_error", { error_type: "network_error" });
      setErrorDetail((e as Error).message || "通信エラー");
      setResult("error");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 送信完了画面
  if (result === "success" || result === "success_no_email") {
    const hasHeavyDog = form.dogs.some((d) => parseFloat(d.weight) >= 15);
    const isLate = (() => {
      if (!form.date) return false;
      const now = new Date();
      const bookingDate = new Date(form.date + "T00:00:00");
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return bookingDate.getTime() === tomorrow.getTime() && now.getHours() >= 17;
    })();
    const isPending = hasHeavyDog || isLate;
    return (
      <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isPending ? "bg-amber-100" : "bg-green-100"}`}>
            <svg className={`w-8 h-8 ${isPending ? "text-amber-600" : "text-green-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-medium">
            {isPending ? "仮予約を受け付けました" : "ご予約ありがとうございます"}
          </h1>
          <p className="text-sm text-[#888] leading-relaxed">
            {isLate
              ? "前日17時以降のため、仮予約としてお受けしました。翌朝9時までにスタッフが確認のうえ、メールにて確定のご連絡をいたします。"
              : hasHeavyDog
                ? "スタッフが確認後、メールにてご連絡いたします。しばらくお待ちください。"
                : "確認メールをお送りしました。当日お気をつけてお越しください。"}
          </p>
          {result === "success_no_email" && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg leading-relaxed">
              予約は完了しましたが、確認メールの送信がうまくいきませんでした。スタッフから折り返しご連絡いたしますので、しばらくお待ちください。
            </p>
          )}
          <div className="text-sm text-[#888] text-left space-y-1">
            <p>ワクチン証明書（狂犬病・混合）を当日ご持参ください。</p>
            <p>住所: 箱根町仙石原928-15</p>
            <p>TEL: <a href="tel:0460800290" className="text-[#B87942]">0460-80-0290</a></p>
          </div>
          <div className="text-sm text-[#888] text-left bg-[#F8F5F0] p-3 rounded-lg leading-relaxed">
            <p>翌日も預けたい場合や、宿泊＋日中預かりなど複数日のご利用は「続けて予約する」から追加できます。お客さま・ワンちゃんの情報は入力不要です。</p>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => {
                setResult(null);
                setStep(1);
                // 顧客情報・犬情報は保持し、予約内容のみリセット
                setForm((prev) => ({
                  ...INITIAL_FORM,
                  customer: prev.customer,
                  dogs: prev.dogs,
                }));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full px-8 py-3 bg-[#B87942] text-white rounded-xl text-sm font-medium"
            >
              続けて予約する（翌日の預かり追加など）
            </button>
            <Link
              href="/"
              className="w-full px-8 py-3 border border-[#E5DDD8] text-[#888] rounded-xl text-sm font-medium text-center"
            >
              ホームページへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // エラー画面
  if (result === "error") {
    return (
      <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-medium">送信に失敗しました</h1>
          <p className="text-sm text-[#888] leading-relaxed">
            {errorDetail || "通信エラーが発生しました。"}もう一度お試しいただくか、お電話にてご予約ください。
          </p>
          <p className="text-sm font-medium">TEL: <a href="tel:0460800290" className="text-[#B87942]">0460-80-0290</a></p>
          <button
            onClick={() => setResult(null)}
            className="inline-block mt-4 px-8 py-3 bg-[#B87942] text-white rounded-xl text-sm font-medium"
          >
            戻って再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8F5F0]">
      {/* ヘッダー */}
      <header className="bg-white border-b border-[#E5DDD8] sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#888]">
            ← トップへ
          </Link>
          <h1 className="font-medium text-[15px]">ご予約</h1>
          {isLiff && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">LINE連携中</span>
          )}
          {!isLiff && <div className="w-16" />}
        </div>
      </header>

      {/* GW告知（期間限定） */}
      {(() => {
        const now = new Date();
        if (now >= new Date("2026-04-06") && now < new Date("2026-05-12")) {
          return (
            <div className="max-w-lg mx-auto px-4 pt-3">
              <div style={{ background: "#F0FDF4", borderLeft: "3px solid #15803d", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", color: "#15803d" }}>
                GW期間（4/30〜5/10）はペットホテルを休まず営業しています。ご予約はお早めに。5/11（月）・5/12（火）は臨時休業です。
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* 当日予約の案内 */}
      <div className="max-w-lg mx-auto px-4 pt-3">
        <div className="bg-white border border-[#E5DDD8] rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">📞</span>
          <div>
            <p className="text-[13px] text-[#3C200F] font-medium">当日のご予約・お問い合わせはお電話で</p>
            <a href="tel:0460800290" className="text-[14px] text-[#B87942] font-medium">0460-80-0290</a>
            <p className="text-[11px] text-[#888] mt-0.5">オンライン予約は前日17:00まで受付</p>
          </div>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="max-w-lg mx-auto px-4">
        <StepIndicator current={step} />
      </div>

      {/* フォーム */}
      <main className="max-w-lg mx-auto px-4 pb-8">
        {step === 1 && (<>
          <Step1Plan form={form} onChange={setForm} onNext={() => { if (editingFromConfirm) { setEditingFromConfirm(false); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); } else { goNext(); } }} />
          {editingFromConfirm && (
            <button type="button" onClick={() => { setEditingFromConfirm(false); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="w-full py-3 mt-3 rounded-xl border-2 border-[#B87942] text-[#B87942] text-sm font-medium">
              確認画面に戻る
            </button>
          )}
        </>)}
        {step === 2 && (<>
          <Step2Dogs form={form} onChange={setForm} onNext={() => { if (editingFromConfirm) { setEditingFromConfirm(false); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); } else { goNext(); } }} onBack={goBack} />
          {editingFromConfirm && (
            <button type="button" onClick={() => { setEditingFromConfirm(false); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="w-full py-3 mt-3 rounded-xl border-2 border-[#B87942] text-[#B87942] text-sm font-medium">
              確認画面に戻る
            </button>
          )}
        </>)}
        {step === 3 && (<>
          <Step3Customer form={form} onChange={setForm} onNext={() => { if (editingFromConfirm) { setEditingFromConfirm(false); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); } else { goNext(); } }} onBack={goBack} />
          {editingFromConfirm && (
            <button type="button" onClick={() => { setEditingFromConfirm(false); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="w-full py-3 mt-3 rounded-xl border-2 border-[#B87942] text-[#B87942] text-sm font-medium">
              確認画面に戻る
            </button>
          )}
        </>)}
        {step === 4 && (
          <Step4Confirm form={form} onChange={setForm} onSubmit={handleSubmit} onBack={goBack} onGoToStep={(s) => { setEditingFromConfirm(true); setStep(s as BookingStep); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        )}
      </main>
    </div>
  );
}
