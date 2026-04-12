"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthStore } from "@/lib/store";
import { formatTimeKorean } from "@/lib/data";
import { AVATAR_EMOJIS, UNIVERSITIES, YEARS } from "@/lib/types";
import { useGroups, useRequireAuth, useSessions } from "@/lib/hooks";
import { getTotalSeconds, getUserSessions } from "@/lib/analytics";

export default function ProfilePage() {
  const router = useRouter();
  const user = useRequireAuth();
  const groups = useGroups();
  const allSessions = useSessions();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [uniInput, setUniInput] = useState("");
  const [year, setYear] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("");
  const [uniOpen, setUniOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const activeUser = user;

  const filteredUnis = UNIVERSITIES.filter((item) => item.includes(uniInput)).slice(0, 5);

  if (!activeUser) return null;

  const myGroups = groups;
  const totalSessions = getUserSessions(allSessions, activeUser.id);
  const totalSec = getTotalSeconds(totalSessions);

  const handleStartEdit = () => {
    setNickname(activeUser.nickname);
    setUniversity(activeUser.university);
    setUniInput(activeUser.university);
    setMajor(activeUser.major);
    setYear(activeUser.year);
    setAvatarEmoji(activeUser.avatarEmoji);
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      setError("");

      const updated = await AuthStore.updateCurrentUser({
        nickname: nickname.trim() || activeUser.nickname,
        university: university.trim() || uniInput.trim() || activeUser.university,
        major: major.trim() || activeUser.major,
        year: year || activeUser.year,
        avatarEmoji: avatarEmoji || activeUser.avatarEmoji,
      });

      if (!updated) return;

      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "프로필 저장에 실패했어요.";
      setError(message);

      if (message.includes("다시 로그인")) {
        router.replace("/login");
      }
    }
  };

  const handleLogout = () => {
    AuthStore.logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] pb-24 fade-in">
      {saved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-xl slide-up bg-[var(--pochita-orange)]">
          ✓ 성공적으로 저장되었습니다
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-xl slide-up bg-red-500">
          {error}
        </div>
      )}

      <div className="page-shell pt-8 pb-4 bg-white border-b border-[var(--pochita-border)] flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--pochita-text)]">
            내 정보
          </h1>
          <p className="text-sm text-[var(--pochita-text-sec)] font-medium mt-3">프로필 및 앱 설정</p>
        </div>
        <button
          onClick={() => (editing ? handleSave() : handleStartEdit())}
          className={`px-5 py-3 rounded-2xl font-semibold text-sm shadow-sm active:scale-95 transition-all ${
            editing
              ? "bg-[var(--pochita-orange)] text-white shadow-orange-100"
              : "bg-white text-[var(--pochita-text-sec)] border border-[var(--pochita-border)]"
          }`}
        >
          {editing ? "저장" : "편집"}
        </button>
      </div>

      <div className="page-shell mt-4 page-stack slide-up">
        {editing ? (
          <div className="page-stack">
            <div>
              <label className="block text-xs font-semibold text-[var(--pochita-text-sec)] mb-5 ml-1 uppercase tracking-widest">나의 아바타</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_EMOJIS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setAvatarEmoji(item)}
                    className="aspect-square rounded-[24px] text-2xl flex items-center justify-center transition-all bg-white border shadow-sm"
                    style={{
                      borderColor: avatarEmoji === item ? "var(--pochita-orange)" : "var(--pochita-border)",
                      boxShadow: avatarEmoji === item ? "0 0 0 2px var(--pochita-orange) inset" : "none",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="block-stack">
              <div className="field-group">
                <label className="field-label">닉네임</label>
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">대학교</label>
                <div className="relative">
                  <input
                    value={uniInput}
                    onChange={(event) => {
                      setUniInput(event.target.value);
                      setUniversity(event.target.value);
                      setUniOpen(true);
                    }}
                    onFocus={() => setUniOpen(true)}
                    className="field-input"
                  />
                  {uniOpen && uniInput && filteredUnis.length > 0 && (
                    <div className="absolute z-20 w-full mt-3 rounded-[24px] overflow-hidden shadow-2xl bg-white border border-[var(--pochita-border)] p-2">
                      {filteredUnis.map((item) => (
                        <button
                          key={item}
                          onMouseDown={() => {
                            setUniversity(item);
                            setUniInput(item);
                            setUniOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-[var(--pochita-text)] hover:bg-orange-50 rounded-xl transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">전공</label>
                <input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">학년</label>
                <div className="grid grid-cols-3 gap-3">
                  {YEARS.map((item) => (
                    <button
                      key={item}
                      onClick={() => setYear(item)}
                      className="py-3.5 rounded-[20px] text-xs font-semibold transition-all border"
                      style={{
                        background: year === item ? "var(--pochita-orange)" : "white",
                        color: year === item ? "white" : "var(--pochita-text-sec)",
                        borderColor: year === item ? "var(--pochita-orange)" : "var(--pochita-border)",
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setEditing(false)} className="w-full py-4 text-sm font-semibold text-[var(--pochita-text-sec)]">
              취소하고 돌아가기
            </button>
          </div>
        ) : (
          <div className="page-stack">
            <div className="px-4 py-4 bg-white rounded-[32px] border border-[var(--pochita-border)] shadow-sm flex items-center gap-3">
              <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center text-4xl shadow-inner border border-orange-100">
                {activeUser.avatarEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-semibold text-[var(--pochita-text)] truncate">{activeUser.nickname}</p>
                <p className="text-sm font-semibold text-[var(--pochita-text-sec)] truncate">
                  {activeUser.university} · {activeUser.major}
                </p>
                <p className="text-xs text-gray-400 mt-1">{activeUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "총 딴짓", value: formatTimeKorean(totalSec) || "0초" },
                { label: "누적 세션", value: `${totalSessions.length}회` },
                { label: "소속 그룹", value: `${myGroups.length}개` },
              ].map((item) => (
                <div key={item.label} className="px-3 py-3 bg-white rounded-[24px] border border-[var(--pochita-border)] shadow-sm text-center">
                  <p className="text-sm font-semibold text-[var(--pochita-text)] mb-1 truncate">{item.value}</p>
                  <p className="text-[10px] font-semibold text-[var(--pochita-text-sec)] uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="block-stack">
              <div className="bg-white rounded-[32px] border border-[var(--pochita-border)] shadow-sm overflow-hidden">
                {[
                  { label: "딴짓 레포트", icon: "📊", href: "/stats" },
                  { label: "누적 랭킹", icon: "🏆", href: "/ranking" },
                  { label: "내 그룹 보기", icon: "👥", href: "/groups" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors border-b border-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm font-semibold text-[var(--pochita-text)]">{item.label}</span>
                    </div>
                    <span className="text-gray-300 font-light text-xl">›</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-red-50 transition-colors text-left text-red-500"
                >
                  <span className="text-xl">🚪</span>
                  <span className="text-sm font-semibold">로그아웃</span>
                </button>
              </div>
            </div>

            <div className="py-10 text-center flex flex-col items-center">
              <div className="relative w-12 h-12 mb-3 grayscale opacity-30">
                <Image src="/pochita_logo.svg" alt="Pochita" fill className="object-contain" />
              </div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-[0.2em] mb-1">Pochita v2.5.0</p>
              <p className="text-[10px] text-gray-400 font-medium">© 2026 Pochita Team. All rights reserved.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
