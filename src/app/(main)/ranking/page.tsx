"use client";

import { useState } from "react";
import { formatTimeKorean } from "@/lib/data";
import { useRankings, useRequireAuth } from "@/lib/hooks";

type RankTab = "university" | "group" | "personal" | "category";

export default function RankingPage() {
  const user = useRequireAuth();
  const [tab, setTab] = useState<RankTab>("university");
  const { universityRanking, groupRanking, personalRanking, categoryRanking } = useRankings();

  if (!user) return null;

  const hasRows =
    (tab === "university" && universityRanking.length > 0) ||
    (tab === "group" && groupRanking.length > 0) ||
    (tab === "personal" && personalRanking.length > 0) ||
    (tab === "category" && categoryRanking.length > 0);

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] pb-24 fade-in">
      <div className="page-shell pt-8 pb-4 bg-white border-b border-[var(--pochita-border)] mb-4">
        <h1 className="text-3xl font-semibold text-[var(--pochita-text)]">
          누적 랭킹
        </h1>
        <p className="text-sm text-[var(--pochita-text-sec)] font-medium mt-3">이거라도 1위 해봅시다</p>
      </div>

      <div className="page-shell mb-4 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex gap-2 min-w-max">
          {[
            { id: "university", label: "🏫 학교별" },
            { id: "group", label: "👥 그룹별" },
            { id: "personal", label: "👤 개인별" },
            { id: "category", label: "🎯 테마별" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as RankTab)}
              className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                tab === item.id
                  ? "bg-[var(--pochita-orange)] text-white shadow-lg"
                  : "bg-white text-[var(--pochita-text-sec)] border border-[var(--pochita-border)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-shell block-stack slide-up">
        {tab === "university" &&
          universityRanking.map((row, index) => (
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

        {tab === "group" &&
          groupRanking.map((row, index) => (
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

        {tab === "personal" &&
          personalRanking.map((row, index) => (
            <div key={row.id} className="flex items-center justify-between px-3 py-3 bg-white rounded-[28px] border border-[var(--pochita-border)]">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold ${index < 3 ? "text-[var(--pochita-orange)]" : "text-gray-300"}`}>{index + 1}</span>
                <span className="text-xl">{row.emoji ?? "👤"}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold">{row.name}</p>
                </div>
              </div>
              <span className="text-sm font-semibold timer-digit">{row.minutes.toLocaleString()}m</span>
            </div>
          ))}

        {tab === "category" &&
          categoryRanking.map((row, index) => (
              <div key={row.categoryId} className="flex items-center justify-between px-4 py-4 bg-white rounded-[28px] border border-[var(--pochita-border)]">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-semibold ${index < 3 ? "text-[var(--pochita-orange)]" : "text-gray-300"}`}>{index + 1}</span>
                  <span className="text-2xl">{row.categoryEmoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--pochita-text)]">{row.categoryName}</p>
                    <p className="text-xs font-semibold text-[var(--pochita-text-sec)]">
                      {row.winnerName ? `${row.winnerEmoji ?? "👤"} ${row.winnerName} 님이 1등` : "아직 1등 기록이 없어요"}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold timer-digit text-right">{formatTimeKorean(row.sec)}</span>
              </div>
            ))}

        {!hasRows && (
          <div className="py-20 text-center text-[var(--pochita-text-sec)] text-sm font-medium bg-white rounded-[24px] border border-[var(--pochita-border)]">
            아직 랭킹을 만들 만큼 데이터가 없어요. 타이머를 몇 번 돌리면 바로 반영됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
