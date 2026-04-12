"use client";

import { useRouter } from "next/navigation";
import { CATEGORIES, formatTimeKorean } from "@/lib/data";
import { useRequireAuth, useUserStats } from "@/lib/hooks";

export default function StatsPage() {
  const router = useRouter();
  const user = useRequireAuth();
  const stats = useUserStats(user?.id);

  if (!user) return null;

  const todaySec = stats?.todaySec ?? 0;
  const totalSec = stats?.totalSec ?? 0;
  const avgSec = stats?.averageSec ?? 0;
  const maxSessionSec = stats?.maxSessionSec ?? 0;
  const categorySeconds = Object.fromEntries((stats?.categoryBreakdown ?? []).map((item) => [item.categoryId, item.seconds]));
  const catBreakdown = CATEGORIES.map((category) => ({ ...category, sec: categorySeconds[category.id] ?? 0 })).filter((category) => category.sec > 0).sort((a, b) => b.sec - a.sec);
  const days = (stats?.weeklyBreakdown ?? []).map((day) => ({ label: day.label, sec: day.seconds }));
  const maxCatSec = catBreakdown[0]?.sec || 1;
  const maxDaySec = Math.max(...days.map((day) => day.sec), 1);

  const achievements = [
    { label: "딴짓 입문자", desc: "첫 세션 기록", emoji: "🌱", done: totalSec > 0 },
    { label: "1시간 집중", desc: "한 번에 1시간 이상", emoji: "⏰", done: maxSessionSec >= 3600 },
    { label: "일주일 기록", desc: "7일 연속 기록", emoji: "📅", done: days.filter((day) => day.sec > 0).length >= 7 },
    { label: "딴짓 달인", desc: "총 10시간 달성", emoji: "🏅", done: totalSec >= 36000 },
    { label: "오늘의 몰입왕", desc: "오늘 5시간 이상", emoji: "🔥", done: todaySec >= 18000 },
  ];

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] text-[var(--pochita-text)] font-sans pb-24">
      <div className="page-shell pt-6 pb-3">
        <h1 className="text-[26px] font-semibold text-[var(--pochita-text)] leading-snug tracking-tight">나의 통계</h1>
        <p className="text-[13px] text-gray-500 mt-2">{user.nickname}님의 딴짓 기록</p>
      </div>

      <div className="page-shell page-stack">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "오늘 딴짓", value: todaySec > 0 ? formatTimeKorean(todaySec) : "0초", sub: "오늘 기록", color: "var(--pochita-orange)" },
            { label: "누적 딴짓", value: totalSec > 0 ? formatTimeKorean(totalSec) : "0초", sub: "전체 누적", color: "var(--pochita-orange)" },
            { label: "세션 평균", value: avgSec > 0 ? formatTimeKorean(avgSec) : "-", sub: "세션당 평균", color: "var(--pochita-orange)" },
            { label: "최장 기록", value: maxSessionSec > 0 ? formatTimeKorean(maxSessionSec) : "-", sub: "가장 긴 세션", color: "var(--pochita-orange)" },
          ].map((item) => (
            <div key={item.label} className="px-4 py-4 rounded-[28px] bg-white border border-gray-200 shadow-sm flex flex-col justify-between min-h-[112px]">
              <p className="text-[13px] font-semibold text-gray-500 leading-tight">{item.label}</p>
              <div>
                <p className="text-[18px] font-semibold mt-2" style={{ color: item.color, letterSpacing: "-0.02em" }}>{item.value}</p>
                <p className="text-[12px] text-gray-400 mt-2 font-medium leading-tight">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-4 rounded-[32px] bg-white border border-gray-200 shadow-sm">
          <p className="text-[15px] font-semibold text-[var(--pochita-text)] mb-4 leading-tight">최근 7일</p>
          <div className="flex items-end gap-2 h-28">
            {days.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg transition-all" style={{ height: `${(day.sec / maxDaySec) * 90}px`, background: day.sec > 0 ? "var(--pochita-orange)" : "#F2F4F6", minHeight: "8px" }} />
                <span className="text-[11px] font-semibold text-gray-500">{day.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
            <p className="text-[12px] font-semibold text-gray-500">이번 주 총합</p>
            <p className="text-[14px] font-semibold text-[var(--pochita-text)]">{formatTimeKorean(days.reduce((sum, day) => sum + day.sec, 0))}</p>
          </div>
        </div>

        {catBreakdown.length > 0 && (
          <div className="rounded-[28px] bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-[15px] font-semibold text-[var(--pochita-text)] leading-normal">카테고리별 딴짓</p>
            </div>
            <div className="px-4 pb-4 pt-2 space-y-3">
              {catBreakdown.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <span className="text-2xl w-8 text-center">{category.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-[13px] mb-1 font-semibold">
                      <span className="text-gray-600">{category.label}</span>
                      <span style={{ color: category.color }}>{formatTimeKorean(category.sec)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(category.sec / maxCatSec) * 100}%`, background: category.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[28px] bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-[15px] font-semibold text-[var(--pochita-text)] leading-normal">업적</p>
          </div>
          <div>
            {achievements.map((achievement, index) => (
              <div key={achievement.label} className={`flex items-center gap-3 px-4 py-3 ${index !== achievements.length - 1 ? "border-b border-gray-100" : ""}`} style={{ opacity: achievement.done ? 1 : 0.6 }}>
                <div className="w-12 h-12 rounded-[20px] flex items-center justify-center text-2xl bg-gray-50 border border-gray-100 shadow-sm" style={{ filter: achievement.done ? "none" : "grayscale(1)" }}>
                  {achievement.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold" style={{ color: "var(--pochita-text)" }}>{achievement.label}</p>
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5">{achievement.desc}</p>
                </div>
                {achievement.done && <span className="text-[11px] px-2.5 py-1 rounded-lg font-semibold bg-orange-50 text-[var(--pochita-orange)] border border-orange-100">달성</span>}
              </div>
            ))}
          </div>
        </div>

        {totalSec === 0 && (
          <div className="py-12 mt-6 text-center bg-white rounded-[24px] border border-gray-200 shadow-sm">
            <p className="text-4xl mb-3">📉</p>
            <p className="text-[15px] font-semibold text-gray-700">아직 딴짓 기록이 없어요.</p>
            <p className="text-[13px] text-gray-500 mt-1 mb-5">지금부터 첫 기록을 시작해보세요.</p>
            <button onClick={() => router.push("/home")} className="px-8 py-4 rounded-2xl text-[14px] font-semibold text-white shadow-sm transition-all" style={{ background: "var(--pochita-orange)" }}>
              딴짓 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
