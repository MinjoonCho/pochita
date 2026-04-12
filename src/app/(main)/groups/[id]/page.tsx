"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { formatTime, formatTimeKorean } from "@/lib/data";
import { GroupStore } from "@/lib/store";
import { useActiveTimer, useGroupDetail, useRequireAuth } from "@/lib/hooks";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useRequireAuth();
  const activeTimer = useActiveTimer();
  const groupDetail = useGroupDetail(id);
  const [showInvite, setShowInvite] = useState(false);
  const [memberToKick, setMemberToKick] = useState<{ userId: string; nickname: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user) return null;
  if (!groupDetail) {
    return (
      <div className="min-h-screen bg-[var(--pochita-bg)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--pochita-orange)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const { group, members } = groupDetail;
  const isMember = members.some((member) => member.userId === user.id);
  const me = members.find((member) => member.userId === user.id);
  const isOwner = me?.role === "owner";

  if (!group || !isMember) {
    return (
      <div className="min-h-screen bg-[var(--pochita-bg)] px-6 pt-20">
        <button onClick={() => router.back()} className="text-[var(--pochita-text-sec)] font-semibold mb-6">이전으로 가기</button>
        <div className="bg-white rounded-[28px] border border-[var(--pochita-border)] p-8 text-center shadow-sm">
          <p className="text-5xl mb-4">😵</p>
          <p className="text-lg font-semibold text-[var(--pochita-text)] mb-2">그룹을 찾을 수 없어요.</p>
          <p className="text-sm text-[var(--pochita-text-sec)]">참여하지 않은 그룹이거나 이미 삭제된 그룹일 수 있어요.</p>
        </div>
      </div>
    );
  }

  const totalTodaySeconds = members.reduce((total, member) => total + member.todaySec, 0);
  const totalAllTimeSeconds = members.reduce((total, member) => total + member.totalSec, 0);
  const inviteLink = typeof window === "undefined" ? `/groups?invite=${group.inviteCode}` : `${window.location.origin}/groups?invite=${group.inviteCode}`;

  const handleCopyInvite = async () => {
    const message = `[포치타] 함께 딴짓 기록할 팀원을 모집합니다\n그룹: ${group.emoji} ${group.name}\n링크: ${inviteLink}\n코드: ${group.inviteCode}${group.requiresPassword ? "\n비밀번호는 그룹장에게 문의해주세요." : ""}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: `${group.emoji} ${group.name}`,
        text: group.requiresPassword ? "비밀번호는 그룹장에게 문의해주세요." : "링크와 코드만 있으면 바로 참여할 수 있어요.",
        url: inviteLink,
      });
    } else {
      await navigator.clipboard.writeText(message);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshInviteCode = async () => {
    await GroupStore.regenerateInviteCode(group.id);
  };

  const handleKickMember = async () => {
    if (!memberToKick) return;
    await GroupStore.removeMember(group.id, user.id, memberToKick.userId);
    setMemberToKick(null);
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] pb-24 fade-in">
      <div className="page-shell pt-8 pb-4 bg-white border-b border-[var(--pochita-border)] flex items-center gap-2 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-xl font-semibold text-[var(--pochita-text-sec)]">←</button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-[var(--pochita-text)] truncate">{group.emoji} {group.name}</h1>
          <p className="text-xs text-[var(--pochita-text-sec)] font-medium truncate">{group.description || "함께 기록하는 딴짓 공간"}</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="p-3 rounded-2xl bg-orange-50 text-[var(--pochita-orange)] border border-orange-100 font-semibold text-sm shadow-sm active:scale-95 transition-all">초대</button>
      </div>

      <div className="page-shell mt-4 flex gap-2">
        <div className="flex-1 px-3 py-3 bg-white rounded-3xl border border-[var(--pochita-border)] shadow-sm text-center">
          <p className="text-2xl font-semibold text-[var(--pochita-text)] timer-digit">{members.length}</p>
          <p className="text-[10px] font-semibold text-[var(--pochita-text-sec)] uppercase tracking-widest">Members</p>
        </div>
        <div className="flex-1 px-3 py-3 bg-white rounded-3xl border border-[var(--pochita-border)] shadow-sm text-center">
          <p className="text-2xl font-semibold text-[var(--pochita-orange)] timer-digit">{Math.floor(totalTodaySeconds / 60)}</p>
          <p className="text-[10px] font-semibold text-[var(--pochita-text-sec)] uppercase tracking-widest">Today (m)</p>
        </div>
        <div className="flex-1 px-3 py-3 bg-white rounded-3xl border border-[var(--pochita-border)] shadow-sm text-center">
          <p className="text-2xl font-semibold text-[var(--pochita-text)] timer-digit">{Math.floor(totalAllTimeSeconds / 60)}</p>
          <p className="text-[10px] font-semibold text-[var(--pochita-text-sec)] uppercase tracking-widest">All Time (m)</p>
        </div>
      </div>

      <div className="page-shell mt-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--pochita-border)] text-xs font-semibold text-[var(--pochita-text-sec)]">
          <span>{group.requiresPassword ? "비밀번호 보호 그룹" : "코드만 있으면 참여 가능"}</span>
        </div>
      </div>

      <div className="page-shell mt-5 page-stack">
        <h2 className="text-lg font-semibold text-[var(--pochita-text)] px-1">멤버 현황</h2>
        <div className="block-stack slide-up">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between px-3 py-3 bg-white rounded-[28px] border border-[var(--pochita-border)] shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="text-3xl">{member.avatarEmoji || "🙂"}</span>
                  {activeTimer?.userId === member.userId && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--pochita-text)]">{member.nickname} {member.userId === user.id ? "(나)" : ""}</p>
                  <p className="text-[10px] font-semibold text-[var(--pochita-text-sec)]">{member.university} · {member.major}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                {isOwner && member.role !== "owner" && <button onClick={() => setMemberToKick({ userId: member.userId, nickname: member.nickname })} className="px-3 py-2 rounded-full bg-red-50 text-red-500 text-[11px] font-semibold border border-red-100">추방</button>}
                <div>
                  <p className="text-sm font-semibold text-[var(--pochita-orange)] timer-digit">{formatTime(member.totalSec)}</p>
                  <p className={`text-[10px] font-semibold ${activeTimer?.userId === member.userId ? "text-green-500" : "text-[var(--pochita-text-sec)]"}`}>
                    {activeTimer?.userId === member.userId ? "지금 기록 중" : `오늘 ${formatTimeKorean(member.todaySec)}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setShowInvite(false)}>
          <div className="w-full bg-white rounded-t-[40px] pt-4 pb-12 page-shell shadow-2xl slide-up border-t border-[var(--pochita-border)]" onClick={(event) => event.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            <h3 className="text-xl font-semibold text-[var(--pochita-text)] mb-2">친구 초대하기</h3>
            <p className="text-sm text-[var(--pochita-text-sec)] mb-4 font-medium">링크나 코드만 공유하면 바로 참여할 수 있어요.</p>
            <div className="p-8 rounded-3xl bg-[var(--pochita-bg)] border border-dashed border-[var(--pochita-border)] text-center mb-4">
              <p className="text-xs font-semibold text-[var(--pochita-text-sec)] mb-3 uppercase tracking-widest">초대 링크</p>
              <p className="text-xs font-semibold text-[var(--pochita-orange)] break-all leading-relaxed mb-5">{inviteLink}</p>
              <p className="text-xs font-semibold text-[var(--pochita-text-sec)] mb-4 uppercase tracking-widest">초대 코드</p>
              <p className="text-5xl font-semibold text-[var(--pochita-orange)] tracking-widest">{group.inviteCode}</p>
            </div>
            <div className="flex items-center justify-between px-1 mb-8 text-xs font-semibold">
              <span className="text-[var(--pochita-text-sec)]">{group.requiresPassword ? "비밀번호는 따로 전달해주세요." : "비밀번호 없이 바로 참여할 수 있어요."}</span>
              <button onClick={() => void handleRefreshInviteCode()} className="text-[var(--pochita-orange)]">코드 새로고침</button>
            </div>
            <button onClick={() => void handleCopyInvite()} className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all active:scale-95 shadow-xl ${copied ? "bg-green-500 text-white shadow-green-100" : "bg-[var(--pochita-orange)] text-white shadow-orange-100"}`}>
              {copied ? "복사 완료!" : "초대 링크 공유하기"}
            </button>
          </div>
        </div>
      )}

      {memberToKick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={() => setMemberToKick(null)}>
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-semibold text-[var(--pochita-text)] mb-3">멤버 추방</h3>
            <p className="text-sm text-[var(--pochita-text-sec)] leading-relaxed mb-6">{memberToKick.nickname} 님을 그룹에서 내보낼까요?</p>
            <div className="flex gap-3">
              <button onClick={() => setMemberToKick(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-[var(--pochita-text-sec)] font-semibold">취소</button>
              <button onClick={() => void handleKickMember()} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-semibold">추방</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
