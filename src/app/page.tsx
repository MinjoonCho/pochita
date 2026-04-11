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
      {/* Decorative Gradient Bulbs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-100 rounded-full blur-[80px] opacity-40 animate-pulse" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-orange-50 rounded-full blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Hero Area */}
      <div className="flex flex-col items-center text-center relative z-10 w-full">
        <div className="relative w-40 h-40 mb-12 bounce-in drop-shadow-2xl">
          <Image src="/pochita_logo.svg" alt="Pochita" fill className="object-contain" priority />
        </div>
        
        {/* Message Area Pattern C focus */}
        <div className="space-y-4 slide-up w-full px-4">
          <h1 className="text-[38px] font-semibold text-[var(--pochita-text)] leading-[1.2] tracking-tight">
            포기한 치타의 타이머
          </h1>
          <p className="text-lg text-[var(--pochita-text-sec)] font-medium tracking-tight">
            죄책감 없는 딴짓의 시작, <br /> 포치타와 함께하세요.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
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
        <p className="text-center text-xs font-semibold text-gray-300 uppercase tracking-widest mt-6">
          © 2026 Pochita Team
        </p>
      </div>
    </div>
  );
}
