"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/lib/hooks";
import { AuthStore } from "@/lib/store";
import { AVATAR_EMOJIS, UNIVERSITIES, YEARS, isUserProfileIncomplete } from "@/lib/types";

function pickLastCharacter(value: string): string {
  const chars = Array.from(value.trim());
  return chars[chars.length - 1] ?? "";
}

export default function SignupDetailPage() {
  const router = useRouter();
  const currentUser = useAuthUser();
  const isGoogleProfileSetup = currentUser?.authProvider === "google" && isUserProfileIncomplete(currentUser);
  const googleDefaultName = currentUser?.nickname ?? "";
  const [step, setStep] = useState<1 | 2 | 3>(isGoogleProfileSetup ? 2 : 1);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [name, setName] = useState("");
  const [hasEditedName, setHasEditedName] = useState(false);
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(currentUser?.avatarEmoji ?? "🐶");
  const [customEmoji, setCustomEmoji] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [error, setError] = useState("");

  const filteredUnis = useMemo(() => UNIVERSITIES.filter((u) => u.includes(schoolInput)).slice(0, 10), [schoolInput]);
  const effectiveStep = isGoogleProfileSetup && step === 1 ? 2 : step;
  const visibleName = hasEditedName ? name : googleDefaultName;
  const effectiveName = visibleName.trim();
  const effectiveAvatarEmoji = pickLastCharacter(customEmoji) || avatarEmoji || currentUser?.avatarEmoji || "🐶";
  const canProceedWithProfile = Boolean(effectiveName && school && major && year);

  if (currentUser && !isGoogleProfileSetup) return null;

  const handleNextStep = () => {
    if (effectiveStep === 1) {
      if (!email || !pw || !pwConfirm) return setError("정보를 모두 입력해주세요.");
      if (pw !== pwConfirm) return setError("비밀번호가 일치하지 않습니다.");
      if (pw.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
      setError("");
      setStep(2);
      return;
    }

    if (!canProceedWithProfile) {
      setError("프로필 정보를 모두 입력해주세요.");
      return;
    }

    setError("");
    setStep(3);
  };

  const handleFinish = async () => {
    const profile = {
      nickname: effectiveName,
      university: school,
      major,
      year,
      avatarEmoji: effectiveAvatarEmoji,
    };

    try {
      if (isGoogleProfileSetup) await AuthStore.updateCurrentUser(profile);
      else await AuthStore.register(email, pw, profile);

      const nextPath = typeof window === "undefined" ? "/home" : new URLSearchParams(window.location.search).get("next") ?? "/home";
      router.replace(nextPath);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "가입 중 오류가 발생했습니다.");
      setStep(isGoogleProfileSetup ? 2 : 1);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] page-shell pt-12 pb-12 fade-in flex flex-col">
      <div className="mb-10">
        <button onClick={() => router.back()} className="mb-6 text-[var(--pochita-text-sec)] font-semibold">이전으로 가기</button>
        <div className="flex gap-2 mb-7">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: s <= effectiveStep ? "var(--pochita-orange)" : "var(--pochita-border)" }} />
          ))}
        </div>
        <h1 className="text-2xl font-semibold text-[var(--pochita-text)]">
          {effectiveStep === 1 ? "계정 정보 입력" : effectiveStep === 2 ? "프로필 완성하기" : "아바타 선택"}
        </h1>
      </div>

      <div className="flex-1 slide-up">
        {effectiveStep === 1 && !isGoogleProfileSetup && (
          <div className="block-stack">
            <div className="field-group">
              <label className="field-label">이메일</label>
              <input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
            </div>
            <div className="field-group">
              <label className="field-label">비밀번호</label>
              <input type="password" placeholder="6자 이상 입력" value={pw} onChange={(e) => setPw(e.target.value)} className="field-input" />
            </div>
            <div className="field-group">
              <label className="field-label">비밀번호 확인</label>
              <input type="password" placeholder="비밀번호를 다시 입력해주세요" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} className="field-input" />
            </div>
          </div>
        )}

        {effectiveStep === 2 && (
          <div className="block-stack">
            <div className="field-group">
              <label className="field-label">닉네임</label>
              <input
                type="text"
                placeholder="포치타"
                value={visibleName}
                onChange={(e) => {
                  setHasEditedName(true);
                  setName(e.target.value);
                }}
                className="field-input"
              />
            </div>

            <div className="relative">
              <label className="field-label">학교</label>
              <input
                placeholder="학교를 검색해보세요"
                value={schoolInput}
                onChange={(e) => {
                  setSchoolInput(e.target.value);
                  setIsSchoolOpen(true);
                }}
                onFocus={() => setIsSchoolOpen(true)}
                className="field-input"
              />
              {school && <p className="mt-1 text-xs text-[var(--pochita-orange)] font-semibold ml-1">선택된 학교: {school}</p>}
              {isSchoolOpen && schoolInput && filteredUnis.length > 0 && (
                <div className="absolute z-10 w-full mt-3 rounded-[22px] bg-white shadow-xl border border-[var(--pochita-border)] max-h-48 overflow-y-auto p-1">
                  {filteredUnis.map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setSchool(u);
                        setSchoolInput(u);
                        setIsSchoolOpen(false);
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-orange-50 text-sm font-semibold text-[var(--pochita-text)]"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">전공</label>
              <input type="text" placeholder="전공을 입력해주세요" value={major} onChange={(e) => setMajor(e.target.value)} className="field-input" />
            </div>

            <div className="field-group">
              <label className="field-label">학년</label>
              <div className="grid grid-cols-3 gap-3">
                {YEARS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setYear(item)}
                    className="py-3.5 rounded-[20px] text-xs font-semibold transition-all"
                    style={{
                      background: year === item ? "var(--pochita-orange)" : "white",
                      color: year === item ? "white" : "var(--pochita-text-sec)",
                      border: `1px solid ${year === item ? "var(--pochita-orange)" : "var(--pochita-border)"}`,
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {effectiveStep === 3 && (
          <div>
            <p className="text-sm font-semibold text-[var(--pochita-text-sec)] mb-6 text-center">마음에 드는 아바타를 골라보세요.</p>
            <input
              value={customEmoji}
              onChange={(event) => setCustomEmoji(event.target.value)}
              placeholder="직접 이모지를 입력해도 좋아요"
              className="field-input mb-5"
            />
            <div className="grid grid-cols-4 gap-4">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatarEmoji(emoji)}
                  className="aspect-square text-3xl flex items-center justify-center rounded-[24px] bg-white shadow-sm border transition-all"
                  style={{
                    borderColor: effectiveAvatarEmoji === emoji ? "var(--pochita-orange)" : "transparent",
                    boxShadow: effectiveAvatarEmoji === emoji ? "0 0 0 2px var(--pochita-orange) inset" : "none",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center border-4 border-[var(--pochita-orange)] text-5xl bounce-in">
                {effectiveAvatarEmoji}
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 font-semibold px-1 mt-4">{error}</p>}
      </div>

      <div className="mt-12">
        <button onClick={effectiveStep === 3 ? handleFinish : handleNextStep} className="w-full py-5 rounded-[24px] bg-[var(--pochita-orange)] text-white font-semibold text-lg active:scale-98 transition-all shadow-lg shadow-orange-100">
          {effectiveStep === 3 ? "가입 완료" : "다음"}
        </button>
      </div>
    </div>
  );
}
