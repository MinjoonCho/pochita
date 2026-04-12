"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CATEGORIES, formatTime } from "@/lib/data";
import { SessionStore, TimerStore } from "@/lib/store";
import { useRequireAuth, useSessions } from "@/lib/hooks";
import { getTodaySessions, getTotalSeconds } from "@/lib/analytics";

export default function HomePage() {
  const router = useRouter();
  const user = useRequireAuth();
  const sessions = useSessions();

  if (!user) return null;

  const todaySeconds = getTotalSeconds(getTodaySessions(sessions, user.id));
  const secondsByCategory = new Map<string, number>();
  for (const session of sessions) {
    if (session.userId !== user.id || !session.duration) continue;
    secondsByCategory.set(session.categoryId, (secondsByCategory.get(session.categoryId) ?? 0) + session.duration);
  }

  const sortedCategories = [...CATEGORIES].sort((a, b) => {
    const diff = (secondsByCategory.get(b.id) ?? 0) - (secondsByCategory.get(a.id) ?? 0);
    return diff !== 0 ? diff : CATEGORIES.findIndex((item) => item.id === a.id) - CATEGORIES.findIndex((item) => item.id === b.id);
  });

  const handleStartDistraction = async (categoryId: string) => {
    const session = await SessionStore.create(user.id, categoryId);
    TimerStore.start(session.id, user.id, categoryId);
    router.push(`/timer?cat=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] pb-24 fade-in">
      <div className="pt-8 pb-6 page-shell text-center bg-white border-b border-[var(--pochita-border)] shadow-sm">
        <div className="relative flex items-center justify-center mb-0">
          <div className="relative w-32 h-32">
            <Image src="/pochita_logo.svg" alt="Logo" fill className="object-contain" />
          </div>
          <button onClick={() => router.push("/profile")} className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[var(--pochita-border)] flex items-center justify-center text-xl bg-orange-50 shadow-sm transition-transform active:scale-95">
            {user.avatarEmoji}
          </button>
        </div>

        <p className="text-sm font-medium text-[var(--pochita-text-sec)] -mt-1 mb-2">
          {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
        </p>
        <h1 className="text-5xl font-bold timer-digit mb-3 text-[var(--pochita-text)]">{formatTime(todaySeconds)}</h1>
        <p className="text-sm font-medium text-[var(--pochita-orange)]">오늘 기록된 총 딴짓 시간</p>
      </div>

      <div className="page-shell mt-4 page-stack">
        <h2 className="text-lg font-medium text-[var(--pochita-text)] px-1 leading-tight">지금 무엇을 하고 있나요?</h2>
        <div className="grid grid-cols-1 gap-2 slide-up">
          {sortedCategories.map((category) => (
            <button key={category.id} onClick={() => handleStartDistraction(category.id)} className="group w-full flex items-center justify-between px-3 py-3 bg-white rounded-[28px] border border-[var(--pochita-border)] shadow-sm active:scale-98 transition-all hover:border-[var(--pochita-orange)]">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl transition-transform group-hover:scale-110 shrink-0" style={{ background: `${category.color}15` }}>
                  {category.emoji}
                </div>
                <div className="text-left pr-2">
                  <p className="text-[17px] font-semibold text-[var(--pochita-text)] leading-tight mb-1">{category.label}</p>
                  <p className="text-[12px] text-[var(--pochita-text-sec)] font-normal leading-[1.45]">{category.description}</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--pochita-bg)] flex items-center justify-center text-[var(--pochita-orange)] group-hover:bg-[var(--pochita-orange)] group-hover:text-white transition-colors shadow-inner shrink-0">
                <span className="text-sm font-semibold">시작</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
