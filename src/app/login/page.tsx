"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthStore } from "@/lib/store";
import { useRedirectIfAuth } from "@/lib/hooks";
import { isUserProfileIncomplete } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  useRedirectIfAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath =
    typeof window === "undefined"
      ? "/home"
      : new URLSearchParams(window.location.search).get("next") ?? "/home";

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const user = await AuthStore.loginWithGoogle();
      router.replace(isUserProfileIncomplete(user) ? "/signup/detail?completeProfile=1" : nextPath);
    } catch (googleError) {
      setError(googleError instanceof Error ? googleError.message : "구글 로그인에 실패했어요.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] flex flex-col items-center justify-between page-shell pt-24 pb-14 fade-in">
      <div className="flex flex-col items-center text-center w-full">
        <div className="relative w-24 h-24 mb-6">
          <Image src="/pochita_logo.svg" alt="Pochita" fill className="object-contain" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--pochita-text)] mb-2">로그인</h2>
        <p className="text-sm text-[var(--pochita-text-sec)] font-medium leading-relaxed">다시 돌아왔네요. 오늘의 딴짓도 기록해볼까요?</p>
      </div>

      <div className="w-full block-stack slide-up">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4.5 rounded-[22px] border border-[var(--pochita-border)] bg-white flex items-center justify-center gap-3 font-semibold text-sm active:scale-98 transition-all shadow-sm"
        >
          <span className="text-lg">🔐</span> {loading ? "구글 계정 확인 중..." : "구글로 로그인"}
        </button>

        <button
          onClick={() => router.push(nextPath === "/home" ? "/login/detail" : `/login/detail?next=${encodeURIComponent(nextPath)}`)}
          className="w-full py-4.5 rounded-[22px] bg-[var(--pochita-text)] text-white flex items-center justify-center gap-3 font-semibold text-sm active:scale-98 transition-all shadow-sm"
        >
          <span className="text-lg">✉️</span> 이메일과 비밀번호로 로그인
        </button>

        {error && <p className="text-sm text-red-500 font-semibold px-1">{error}</p>}

        <div className="pt-3 text-center">
          <button onClick={() => router.push(nextPath === "/home" ? "/signup" : `/signup?next=${encodeURIComponent(nextPath)}`)} className="text-xs text-[var(--pochita-text-sec)] underline underline-offset-4">
            계정이 없다면 회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
