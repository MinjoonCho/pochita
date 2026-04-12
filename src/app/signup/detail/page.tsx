"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/lib/hooks";
import { AuthStore } from "@/lib/store";
import { AVATAR_EMOJIS, UNIVERSITIES, YEARS, isUserProfileIncomplete } from "@/lib/types";

export default function SignupDetailPage() {
  const router = useRouter();
  const currentUser = useAuthUser();
  const isGoogleProfileSetup = currentUser?.authProvider === "google" && isUserProfileIncomplete(currentUser);
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

  const filteredUnis = useMemo(
    () => UNIVERSITIES.filter((u) => u.includes(schoolInput)).slice(0, 10),
    [schoolInput]
  );

  const effectiveStep = isGoogleProfileSetup && step === 1 ? 2 : step;
  const visibleName = hasEditedName ? name : (currentUser?.nickname ?? "");
  const effectiveName = visibleName.trim();
  const effectiveAvatarEmoji = customEmoji || avatarEmoji || currentUser?.avatarEmoji || "🐶";

  useEffect(() => {
    if (currentUser && !isGoogleProfileSetup) {
      const nextPath =
        typeof window === "undefined"
          ? "/home"
          : new URLSearchParams(window.location.search).get("next") ?? "/home";
      router.replace(nextPath);
    }
  }, [currentUser, isGoogleProfileSetup, router]);

  if (currentUser && !isGoogleProfileSetup) return null;

  const handleNextStep = () => {
    if (isGoogleProfileSetup && effectiveStep === 2) {
      if (!effectiveName || !school || !major || !year) {
        setError("정보를 모두 입력해주세요.");
        return;
      }
      setError("");
      setStep(3);
      return;
    }

    if (effectiveStep === 1) {
      if (!email || !pw || !pwConfirm) {
        setError("정보를 모두 입력해주세요.");
        return;
      }
      if (pw !== pwConfirm) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
      if (pw.length < 6) {
        setError("비밀번호는 6자 이상이어야 합니다.");
        return;
      }
      setError("");
      setStep(2);
    } else if (effectiveStep === 2) {
      if (!effectiveName || !school || !major || !year) {
        setError("정보를 모두 입력해주세요.");
        return;
      }
      setError("");
      setStep(3);
    }
  };

  const handleFinish = async () => {
    const userProfile = {
      nickname: effectiveName,
      university: school,
      major,
      year,
      avatarEmoji: effectiveAvatarEmoji,
    };

    try {
      if (isGoogleProfileSetup) {
        await AuthStore.updateCurrentUser(userProfile);
      } else {
        await AuthStore.register(email, pw, userProfile);
      }

      const nextPath =
        typeof window === "undefined"
          ? "/home"
          : new URLSearchParams(window.location.search).get("next") ?? "/home";
      router.replace(nextPath);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "가입 중 오류가 발생했습니다.");
      setStep(isGoogleProfileSetup ? 2 : 1);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pochita-bg)] page-shell pt-12 pb-12 fade-in flex flex-col">
      <div className="mb-10">
        <button onClick={() => router.back()} className="mb-6 text-[var(--pochita-text-sec)] font-semibold">
          이전으로 가기
        </button>
        <div className="flex gap-2 mb-7">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: s <= effectiveStep ? "var(--pochita-orange)" : "var(--pochita-border)" }}
            />
          ))}
        </div>
        <h1 className="text-2xl font-semibold text-[var(--pochita-text)]">
          {isGoogleProfileSetup
            ? effectiveStep === 2
              ? "구글 프로필 완성하기"
              : "아바타 선택"
            : effectiveStep === 1
              ? "계정 정보 설정"
              : effectiveStep === 2
                ? "프로필 완성하기"
                : "아바타 선택"}
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
              <input type="password" placeholder="비밀번호를 다시 입력" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} className="field-input" />
            </div>
          </div>
        )}

        {effectiveStep === 2 && (
          <div className="block-stack">
            <div className="field-group">
              <label className="field-label">사용자 이름</label>
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
              <label className="field-label">소속 대학교</label>
              <div className="flex items-center gap-2">
                <input
                  placeholder="학교 검색 (예: 연세대)"
                  value={schoolInput}
                  onChange={(e) => {
                    setSchoolInput(e.target.value);
                    setIsSchoolOpen(true);
                  }}
                  onFocus={() => setIsSchoolOpen(true)}
                  className="field-input"
                />
              </div>
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
              <input type="text" placeholder="전공 입력" value={major} onChange={(e) => setMajor(e.target.value)} className="field-input" />
            </div>

            <div className="field-group">
              <label className="field-label">학년</label>
              <div className="grid grid-cols-3 gap-3">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className="py-3.5 rounded-[20px] text-xs font-semibold transition-all"
                    style={{
                      background: year === y ? "var(--pochita-orange)" : "white",
                      color: year === y ? "white" : "var(--pochita-text-sec)",
                      border: `1px solid ${year === y ? "var(--pochita-orange)" : "var(--pochita-border)"}`,
                    }}
                  >
                    {y.replace("학년", "")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {effectiveStep === 3 && (
          <div>
            <p className="text-sm font-semibold text-[var(--pochita-text-sec)] mb-6 text-center">나를 표현할 아바타를 골라보세요.</p>
            <input
              value={customEmoji}
              onChange={(event) => setCustomEmoji(Array.from(event.target.value).slice(-1).join(""))}
              placeholder="직접 이모지를 입력해도 좋아요"
              className="field-input mb-5 emoji-glyph"
            />
            <div className="grid grid-cols-4 gap-4">
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setAvatarEmoji(e)}
                  className="aspect-square text-3xl flex items-center justify-center rounded-[24px] bg-white shadow-sm border transition-all emoji-glyph"
                  style={{
                    borderColor: effectiveAvatarEmoji === e ? "var(--pochita-orange)" : "transparent",
                    boxShadow: effectiveAvatarEmoji === e ? "0 0 0 2px var(--pochita-orange) inset" : "none",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center border-4 border-[var(--pochita-orange)] text-5xl bounce-in emoji-glyph">
                {effectiveAvatarEmoji}
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 font-semibold px-1 mt-4">{error}</p>}
      </div>

      <div className="mt-12">
        <button
          onClick={effectiveStep === 3 ? handleFinish : handleNextStep}
          className="w-full py-5 rounded-[24px] bg-[var(--pochita-orange)] text-white font-semibold text-lg active:scale-98 transition-all shadow-lg shadow-orange-100"
        >
          {effectiveStep === 3 ? (isGoogleProfileSetup ? "프로필 저장" : "가입 완료") : "다음"}
        </button>
      </div>
    </div>
  );
}
