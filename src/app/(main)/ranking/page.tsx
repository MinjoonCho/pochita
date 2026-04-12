"use client";

import { useState } from "react";
import SwipePager from "@/components/SwipePager";
import { formatTimeKorean } from "@/lib/data";
import { useRankings, useRequireAuth } from "@/lib/hooks";

type RankTab = "university" | "group" | "personal" | "category";

const TABS: Array<{ id: RankTab; label: string }> = [
  { id: "university", label: "학교 랭킹" },
  { id: "group", label: "그룹 랭킹" },
  { id: "personal", label: "개인 랭킹" },
  { id: "category", label: "카테고리 랭킹" },
];

export default function RankingPage() {
  const user = useRequireAuth();
  const [tab, setTab] = useState<RankTab>("university");
  const { universityRanking, groupRanking, personalRanking, categoryRanking } = useRankings();
  const page = Math.max(0, TABS.findIndex((item) => item.id === tab));

  if (!user) return null;

  const hasRows =
    (tab === "university" && universityRanking.length > 0) ||
    (tab === "group" && groupRanking.length > 0) ||
    (tab === "personal" && personalRanking.length > 0) ||
    (tab === "category" && categoryRanking.length > 0);

  const emptyState = (
    <div className="py-20 text-center text-[var(--pochita-text-sec)] text-sm font-medium bg-white rounded-[24px] border border-[var(--pochita-border)]">
      아직 랭킹을 만들 만큼 데이터가 없어요. 기록을 조금만 더 쌓아보세요.
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] pb-24 fade-in">
      <div className="page-shell pt-8 pb-4 bg-white border-b border-[var(--pochita-border)] mb-4">
        <h1 className="text-3xl font-semibold text-[var(--pochita-text)]">누적 랭킹</h1>
        <p className="text-sm text-[var(--pochita-text-sec)] font-medium mt-3">내 기록이 어디쯤인지 확인해보세요.</p>
      </div>

      <div className="page-shell mb-4 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex gap-2 min-w-max">
          {TABS.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${tab === item.id ? "bg-[var(--pochita-orange)] text-white shadow-lg" : "bg-white text-[var(--pochita-text-sec)] border border-[var(--pochita-border)]"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <SwipePager index={page} onIndexChange={(nextPage) => setTab(TABS[nextPage]?.id ?? "university")} className="page-shell slide-up">
        <div className="block-stack">
          {universityRanking.map((row, index) => (
            <div key={row.id} className="flex items-center justify-between px-3 py-3 bg-white rounded-[28px] border border-[var(--pochita-border)]">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold ${index < 3 ? "text-[var(--pochita-orange)]" : "text-gray-300"}`}>{index + 1}</span>
                <div className="text-left">
                  <span className="text-sm font-semibold">{row.name}</span>
                  {row.name === user.university && <p className="text-[10px] text-[var(--pochita-orange)] font-semibold mt-1">내 학교</p>}
                </div>
              </div>
              <span className="text-sm font-semibold timer-digit">{row.minutes.toLocaleString()}m</span>
            </div>
          ))}
          {tab === "university" && !hasRows && emptyState}
        </div>

        <div className="block-stack">
          {groupRanking.map((row, index) => (
            <div key={row.id} className="flex items-center justify-between px-3 py-3 bg-white rounded-[28px] border border-[var(--pochita-border)]">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold ${index < 3 ? "text-[var(--pochita-orange)]" : "text-gray-300"}`}>{index + 1}</span>
                <span className="text-xl">{row.emoji ?? "👥"}</span>
                <div className="text-left">
                  <span className="text-sm font-semibold">{row.name}</span>
                  <p className="text-[10px] text-gray-400">{row.memberCount}명 참여</p>
                </div>
              </div>
              <span className="text-sm font-semibold timer-digit">{row.minutes.toLocaleString()}m</span>
            </div>
          ))}
          {tab === "group" && !hasRows && emptyState}
        </div>

        <div className="block-stack">
          {personalRanking.map((row, index) => (
            <div key={row.id} className="flex items-center justify-between px-3 py-3 bg-white rounded-[28px] border border-[var(--pochita-border)]">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold ${index < 3 ? "text-[var(--pochita-orange)]" : "text-gray-300"}`}>{index + 1}</span>
                <span className="text-xl">{row.emoji ?? "🙂"}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold">{row.name}</p>
                </div>
              </div>
              <span className="text-sm font-semibold timer-digit">{row.minutes.toLocaleString()}m</span>
            </div>
          ))}
          {tab === "personal" && !hasRows && emptyState}
        </div>

        <div className="block-stack">
          {categoryRanking.map((row, index) => (
            <div key={row.categoryId} className="flex items-center justify-between px-4 py-4 bg-white rounded-[28px] border border-[var(--pochita-border)]">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold ${index < 3 ? "text-[var(--pochita-orange)]" : "text-gray-300"}`}>{index + 1}</span>
                <span className="text-2xl">{row.categoryEmoji}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--pochita-text)]">{row.categoryName}</p>
                  <p className="text-xs font-semibold text-[var(--pochita-text-sec)]">
                    {row.winnerName ? `${row.winnerEmoji ?? "🙂"} ${row.winnerName} 님이 1위` : "아직 1위 기록이 없어요"}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold timer-digit text-right">{formatTimeKorean(row.sec)}</span>
            </div>
          ))}
          {tab === "category" && !hasRows && emptyState}
        </div>
      </SwipePager>
    </div>
  );
}
