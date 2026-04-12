"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthUser } from "@/lib/hooks";

export default function StartPage() {
  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [router, user]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] flex flex-col items-center justify-between px-8 pt-32 pb-16 fade-in relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-100 rounded-full blur-[80px] opacity-40 animate-pulse" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-orange-50 rounded-full blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="flex flex-col items-center text-center relative z-10 w-full">
        <div className="relative w-40 h-40 mb-12 bounce-in drop-shadow-2xl">
          <Image src="/pochita_logo.svg" alt="Pochita" fill className="object-contain" priority />
        </div>
        <div className="space-y-4 slide-up w-full px-2">
          <h1 className="text-[clamp(28px,8.1vw,38px)] font-semibold text-[var(--pochita-text)] leading-[1.15] tracking-[-0.05em]">
            <span className="text-[var(--pochita-orange)]">시험기간</span>의 딴짓도
            <br />
            기록하면 패턴이 보여요
          </h1>
          <p className="text-lg text-[var(--pochita-text-sec)] font-medium tracking-tight">
            무심코 새는 시간을 기록하고,
            <br />
            포치타와 함께 돌아보세요.
          </p>
        </div>
      </div>

      <div className="w-full space-y-4 slide-up relative z-10" style={{ animationDelay: "0.2s" }}>
        <button
          onClick={() => router.push("/login")}
          className="w-full py-5 rounded-[24px] bg-[var(--pochita-orange)] text-white font-semibold text-xl shadow-2xl shadow-orange-100 active:scale-95 transition-all"
        >
          로그인
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="w-full py-5 rounded-[24px] bg-white border border-[var(--pochita-border)] text-[var(--pochita-text)] font-semibold text-xl active:scale-95 transition-all shadow-sm"
        >
          회원가입
        </button>
        <p className="text-center text-xs font-semibold text-gray-300 uppercase tracking-widest mt-6">© 2026 Pochita Team</p>
      </div>
    </div>
  );
}
