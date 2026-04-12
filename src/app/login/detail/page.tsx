"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRedirectIfAuth } from "@/lib/hooks";
import { AuthStore } from "@/lib/store";

export default function LoginDetailPage() {
  const router = useRouter();
  useRedirectIfAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pw) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await AuthStore.login(email, pw);
      const nextPath = typeof window === "undefined"
        ? "/home"
        : new URLSearchParams(window.location.search).get("next") ?? "/home";
      router.replace(nextPath);
    } catch (error) {
      setError(error instanceof Error ? error.message : "정보가 올바르지 않습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] page-shell pt-12 pb-12 fade-in">
      {/* Header */}
      <div className="mb-10">
        <button onClick={() => router.back()} className="mb-6 text-[var(--pochita-text-sec)] font-semibold">
          ← 뒤로가기
        </button>
        <h1 className="text-2xl font-semibold text-[var(--pochita-text)]">
          아이디로 로그인
        </h1>
      </div>

      {/* Form */}
      <div className="block-stack">
        <div className="field-group">
          <label className="field-label">아이디 (이메일)</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="field-input"
          />
        </div>
        <div className="field-group">
          <label className="field-label">비밀번호</label>
          <input
            type="password"
            placeholder="••••••••"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="field-input"
          />
        </div>
        
        {error && <p className="text-sm text-red-500 font-semibold px-1">{error}</p>}
      </div>

      <div className="mt-12">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-5 rounded-[24px] bg-[var(--pochita-orange)] text-white font-semibold text-lg active:scale-98 transition-all disabled:opacity-50 shadow-lg shadow-orange-100"
        >
          {loading ? "로그인 중..." : "확인"}
        </button>
      </div>
    </div>
  );
}
