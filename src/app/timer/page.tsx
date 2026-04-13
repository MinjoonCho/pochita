"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatTime, CATEGORIES } from "@/lib/data";
import { SessionStore, TimerStore } from "@/lib/store";
import { normalizeUniversityName } from "@/lib/types";
import {
  useActiveTimer,
  useGroupDetail,
  useGroups,
  useRankings,
  useRequireAuth,
} from "@/lib/hooks";

function TimerContent() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useRequireAuth();
  const groups = useGroups();
  const activeTimer = useActiveTimer();
  const { universityRanking, personalRanking, groupRanking } = useRankings();

  const [elapsed, setElapsed] = useState(0);
  const [page, setPage] = useState(0);
  const isCreatingSessionRef = useRef(false);

  const categoryId = params.get("cat") ?? activeTimer?.categoryId ?? "lazy";
  const category = CATEGORIES.find((item) => item.id === categoryId) ?? CATEGORIES[CATEGORIES.length - 1];
  const categoryActivityLabel =
    {
      game: "게임하는 중",
      shortform: "숏폼 보는 중",
      ott: "OTT 보는 중",
      drink: "음주하는 중",
      hangout: "친구랑 노는 중",
      lazy: "멍때리는 중",
    }[category.id] ?? "딴짓하는 중";
  const firstGroupId = groups[0]?.id ?? null;
  const firstGroupDetail = useGroupDetail(firstGroupId);

  useEffect(() => {
    document.body.classList.add("dark");
    return () => document.body.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (!user) return;

    const timer = TimerStore.get();
    if (timer || isCreatingSessionRef.current) return;

    let cancelled = false;
    isCreatingSessionRef.current = true;

    void (async () => {
      try {
        const session = await SessionStore.create(user.id, categoryId);
        if (!cancelled) {
          TimerStore.start(session.id, user.id, categoryId);
        }
      } finally {
        isCreatingSessionRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryId, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timer = TimerStore.get();
      if (timer) setElapsed(TimerStore.getElapsedSeconds(timer));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const groupMembers = useMemo(() => firstGroupDetail?.members ?? [], [firstGroupDetail]);

  if (!user) return null;

  const handleStop = async () => {
    const timer = TimerStore.get();
    if (timer) {
      await SessionStore.finish(timer.sessionId);
      TimerStore.clear();
    }
    router.replace("/home");
  };

  const pages = ["내 그룹", "우리 학교", "전국 랭킹"];
  const universityRows = universityRanking.slice(0, 5);
  const personalRows = personalRanking.slice(0, 5);
  const groupRows = groupRanking.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col pt-12 fade-in">
      <div className="px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.emoji}</span>
          <span className="text-sm font-medium text-[var(--pochita-orange)]">딴짓 중</span>
        </div>
        <button
          onClick={() => void handleStop()}
          className="min-w-[96px] h-11 px-4 rounded-full bg-white/10 text-xs font-semibold border border-white/20 active:bg-white/20 transition-all inline-flex items-center justify-center shrink-0"
        >
          그만하기
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <h1 className="text-7xl font-bold timer-digit mb-4 glow-text">
          {formatTime(elapsed)}
        </h1>
        <p className="text-sm text-gray-400 font-medium">{categoryActivityLabel}</p>
      </div>

      <div className="p-6 bg-[#141414] rounded-t-[40px] border-t border-white/5 shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          {pages.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${page === index ? "w-6 bg-[var(--pochita-orange)]" : "w-1.5 bg-gray-700"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-base font-semibold">{pages[page]} 현황</h2>
          <div className="flex gap-2">
            <button onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0} className="disabled:opacity-20">←</button>
            <button onClick={() => setPage((prev) => Math.min(2, prev + 1))} disabled={page === 2} className="disabled:opacity-20">→</button>
          </div>
        </div>

        <div className="space-y-3 min-h-[300px]">
          {page === 0 && (
            <div className="space-y-3">
              {groups.length > 0 && groupMembers.length > 0 ? (
                <>
                  <div className="px-1 pb-1 text-xs text-gray-400 font-semibold">
                    {firstGroupDetail?.group.emoji} {firstGroupDetail?.group.name}
                  </div>
                  {groupMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                          {member.avatarEmoji ?? "👤"}
                          {activeTimer?.userId === member.userId && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-[#141414] rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {member.nickname} {member.userId === user.id ? "(나)" : ""}
                          </p>
                          <p className={`text-xs ${activeTimer?.userId === member.userId ? "text-green-400" : "text-gray-400"}`}>
                            {activeTimer?.userId === member.userId ? "지금 딴짓 중" : `오늘 ${formatTime(member.todaySec)}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold timer-digit">{formatTime(member.totalSec)}</p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-12 text-center text-gray-500 text-sm">소속 그룹이 없어서 개인 플레이 중이에요.</div>
              )}
            </div>
          )}

          {page === 1 && (
            <div className="space-y-3">
              {universityRows.length > 0 ? (
                universityRows.map((row, index) => (
                  <div key={row.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">{index + 1}위</span>
                      <span className={`text-sm font-semibold ${normalizeUniversityName(row.name) === normalizeUniversityName(user.university) ? "text-white" : "text-gray-300"}`}>
                        {row.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--pochita-orange)] timer-digit">
                      {row.minutes.toLocaleString()}m
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-500 text-sm">아직 학교별 데이터가 없어요.</div>
              )}
            </div>
          )}

          {page === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">전국 개인 TOP 5</p>
                <div className="space-y-3">
                  {personalRows.length > 0 ? (
                    personalRows.map((row, index) => (
                      <div key={row.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-500">{index + 1}위</span>
                          <span className="text-xl">{row.emoji ?? "👤"}</span>
                          <span className="text-sm font-semibold">{row.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--pochita-orange)] timer-digit">
                          {row.minutes.toLocaleString()}m
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-gray-500 text-sm">아직 전국 개인 데이터가 없어요.</div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">그룹 TOP 5</p>
                <div className="space-y-3">
                  {groupRows.length > 0 ? (
                    groupRows.map((row, index) => (
                      <div key={row.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-500">{index + 1}위</span>
                          <span className="text-xl">{row.emoji ?? "👥"}</span>
                          <span className="text-sm font-semibold">{row.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--pochita-orange)] timer-digit">
                          {row.minutes.toLocaleString()}m
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-gray-500 text-sm">아직 그룹 랭킹이 없어요.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TimerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--pochita-orange)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <TimerContent />
    </Suspense>
  );
}
