"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GroupStore } from "@/lib/store";
import { useRequireAuth } from "@/lib/hooks";

const GROUP_EMOJIS = ["🔥", "📚", "🐻", "🎮", "📺", "🍺", "🏁", "🐼", "🌱", "🎯", "💡", "🧠"];

function pickLastCharacter(value: string): string {
  const chars = Array.from(value.trim());
  return chars[chars.length - 1] ?? "";
}

export default function CreateGroupPage() {
  const router = useRouter();
  const user = useRequireAuth();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [password, setPassword] = useState("");
  const [emoji, setEmoji] = useState("🔥");
  const [customEmoji, setCustomEmoji] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleCreate = async () => {
    if (!name.trim()) return setError("그룹 이름을 입력해주세요.");
    if (name.trim().length < 2) return setError("그룹 이름은 2자 이상이어야 해요.");

    setLoading(true);
    setError("");

    try {
      const finalEmoji = pickLastCharacter(customEmoji) || emoji;
      const group = await GroupStore.create(name.trim(), desc.trim(), finalEmoji, user.id, false, password.trim());
      router.replace(`/groups/${group.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "그룹 생성에 실패했어요.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] page-shell pt-12 pb-28 fade-in flex flex-col">
      <div className="mb-8">
        <button onClick={() => router.back()} className="mb-6 text-[var(--pochita-text-sec)] font-semibold">이전으로 가기</button>
        <h1 className="text-3xl font-semibold text-[var(--pochita-text)]">새 그룹 만들기</h1>
      </div>

      <div className="flex-1 page-stack slide-up">
        <div>
          <label className="block text-xs font-semibold text-[var(--pochita-text-sec)] mb-5 ml-1 uppercase tracking-widest">그룹 아이콘</label>
          <input value={customEmoji} onChange={(event) => setCustomEmoji(event.target.value)} placeholder="직접 이모지를 입력해도 좋아요" className="field-input mb-4" />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
            {GROUP_EMOJIS.map((item) => (
              <button
                key={item}
                onClick={() => setEmoji(item)}
                className="aspect-square rounded-[28px] text-3xl flex items-center justify-center transition-all bg-white border shadow-sm"
                style={{
                  borderColor: (pickLastCharacter(customEmoji) || emoji) === item ? "var(--pochita-orange)" : "var(--pochita-border)",
                  boxShadow: (pickLastCharacter(customEmoji) || emoji) === item ? "0 0 0 2px var(--pochita-orange) inset" : "none",
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="block-stack">
          <div className="field-group">
            <label className="field-label">그룹 이름</label>
            <input placeholder="예: 경영학과 시험기간 메이트" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} className="field-input" />
          </div>

          <div className="field-group">
            <label className="field-label">비밀번호 설정 (선택)</label>
            <input type="password" placeholder="설정하면 초대 코드와 함께 비밀번호가 필요해요" value={password} onChange={(event) => setPassword(event.target.value)} className="field-input" />
          </div>

          <div className="field-group">
            <label className="field-label">그룹 소개 (선택)</label>
            <textarea placeholder="어떤 그룹인지 소개해주세요" value={desc} onChange={(event) => setDesc(event.target.value)} rows={4} className="field-textarea" />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-semibold px-1 text-center">{error}</p>}
      </div>

      <div className="floating-action-bar mt-6">
        <button onClick={handleCreate} disabled={loading} className="w-full py-5 rounded-[26px] bg-[var(--pochita-orange)] text-white font-semibold text-xl shadow-xl shadow-orange-100 active:scale-95 transition-all disabled:opacity-50">
          {loading ? "그룹 생성 중..." : "그룹 만들기"}
        </button>
      </div>
    </div>
  );
}
