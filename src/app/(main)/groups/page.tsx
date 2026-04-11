"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GroupStore } from "@/lib/store";
import { useGroups, useRequireAuth } from "@/lib/hooks";

export default function GroupsPage() {
  const router = useRouter();
  const user = useRequireAuth();
  const groups = useGroups();

  const [inviteCode, setInviteCode] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [codeError, setCodeError] = useState("");
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const invitedCode = typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get("invite");
  const normalizedInvitedCode = invitedCode?.toUpperCase() ?? "";
  const effectiveInviteCode = inviteCode || normalizedInvitedCode;
  const isJoinSheetOpen = showJoinSheet || Boolean(normalizedInvitedCode);

  if (!user) return null;

  const myGroups = groups;

  const handleJoinByCode = async () => {
    try {
      const group = await GroupStore.joinByInviteCode(effectiveInviteCode.trim(), user.id, groupPassword);
      setShowJoinSheet(false);
      setInviteCode("");
      setGroupPassword("");
      setCodeError("");
      router.push(`/groups/${group.id}`);
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : "그룹 참가에 실패했어요.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] pb-24 fade-in">
      <div className="page-shell pt-8 pb-4 bg-white border-b border-[var(--pochita-border)] flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--pochita-text)]">
            내 그룹
          </h1>
          <p className="text-sm text-[var(--pochita-text-sec)] font-medium mt-3">백지 시험지도 맞들면 낫다</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinSheet(true)}
            className="px-4 py-3 rounded-2xl bg-orange-50 text-[var(--pochita-orange)] border border-orange-100 font-semibold text-sm shadow-sm active:scale-95 transition-all"
          >
            링크/코드 입력
          </button>
          <button
            onClick={() => router.push("/groups/create")}
            className="w-12 h-12 rounded-2xl bg-[var(--pochita-orange)] text-white text-2xl font-semibold shadow-lg shadow-orange-200 active:scale-95 transition-all"
          >
            +
          </button>
        </div>
      </div>

      <div className="page-shell mt-4 block-stack slide-up">
        {myGroups.length === 0 ? (
          <div className="py-24 text-center section-card px-8">
            <span className="text-6xl mb-6 block">🫠</span>
            <p className="text-lg font-semibold text-[var(--pochita-text)] mb-2">아직 소속된 그룹이 없어요</p>
            <p className="text-sm text-[var(--pochita-text-sec)] mb-8 font-medium leading-relaxed">초대 코드를 입력하거나 새로 만들어보세요</p>
            <button
              onClick={() => router.push("/groups/create")}
              className="px-8 py-4 rounded-2xl bg-[var(--pochita-orange)] text-white font-semibold shadow-lg"
            >
              지금 그룹 만들기
            </button>
          </div>
        ) : (
          myGroups.map((group) => {
            return (
              <button
                key={group.id}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="w-full flex items-center justify-between px-3 py-3 bg-white rounded-[28px] border border-[var(--pochita-border)] shadow-sm active:scale-[0.99] transition-all hover:border-[var(--pochita-orange)]"
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{group.emoji}</div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-[var(--pochita-text)]">{group.name}</p>
                    <p className="text-xs text-[var(--pochita-text-sec)] font-medium truncate max-w-[180px]">
                      {group.description || "함께 딴짓하는 중"}
                    </p>
                    {group.requiresPassword && (
                      <p className="text-[10px] text-[var(--pochita-orange)] font-semibold mt-1">비밀번호 보호 그룹</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--pochita-orange)] timer-digit">{group.memberCount}명</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {isJoinSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
          onClick={() => {
            setShowJoinSheet(false);
            if (normalizedInvitedCode) router.replace("/groups");
          }}
        >
          <div
            className="w-full bg-white rounded-t-[40px] pt-4 pb-12 page-shell shadow-2xl slide-up border-t border-[var(--pochita-border)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            <h3 className="text-xl font-semibold text-[var(--pochita-text)] mb-2">
              초대 링크로 참가
            </h3>
            <p className="text-sm text-[var(--pochita-text-sec)] mb-4 font-medium">링크로 들어왔다면 코드가 채워져 있어요. 바로 참가만 누르면 됩니다.</p>

            <input
              type="text"
              placeholder="예: ABC123"
              maxLength={6}
              value={effectiveInviteCode}
              onChange={(event) => {
                setInviteCode(event.target.value.toUpperCase());
                setCodeError("");
              }}
              className="field-input font-mono text-2xl tracking-widest text-center uppercase mb-4"
            />

            <input
              type="password"
              placeholder="비밀번호가 있는 그룹이면 입력"
              value={groupPassword}
              onChange={(event) => {
                setGroupPassword(event.target.value);
                setCodeError("");
              }}
              className="field-input mb-4"
            />

            {codeError && <p className="text-sm text-red-500 font-semibold mb-4 ml-1">{codeError}</p>}

            <button
              onClick={handleJoinByCode}
              disabled={effectiveInviteCode.length < 6}
              className="w-full py-5 rounded-2xl bg-[var(--pochita-orange)] text-white font-semibold text-lg shadow-xl shadow-orange-100 disabled:opacity-40 active:scale-95 transition-all"
            >
              참가하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
