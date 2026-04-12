export const CATEGORIES = [
  { id: "game", label: "게임", emoji: "🎮", color: "#FF4444", description: "잠깐만 한다고 켰다가 가장 오래 붙잡히는 순간" },
  { id: "shortform", label: "숏폼", emoji: "📱", color: "#FF6B00", description: "한 편만 보려다 무한 스크롤에 빠지는 시간" },
  { id: "ott", label: "OTT", emoji: "📺", color: "#E50914", description: "시험기간엔 더 재밌어 보이는 드라마와 예능" },
  { id: "drink", label: "음주", emoji: "🍺", color: "#FFB800", description: "공부 대신 약속이 생겨버린 밤" },
  { id: "hangout", label: "친구랑 놀기", emoji: "👥", color: "#10B981", description: "잠깐 보자고 했는데 하루가 사라지는 모임" },
  { id: "lazy", label: "멍때리기", emoji: "😴", color: "#6B7280", description: "아무것도 안 했는데 시간은 흘러가는 상태" },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];

export const SNARKY_MESSAGES = [
  "지금도 괜찮다고 생각하면 시험지가 울어요 😶",
  "딴짓에도 재능이 있다는 걸 또 증명했네요 🎯",
  "한 번만 더는 늘 생각보다 길어요 📉",
  "시험기간의 시간은 평소보다 훨씬 비싸요 ⏳",
  "조금만 쉬자는 말이 가장 위험해요 😵",
];

export const FOCUS_OUT_MESSAGES = [
  "돌아가도 늦지 않았어요. 이제 정말 공부할까요?",
  "포치타가 보고 있어요. 슬슬 복귀할 시간이에요 👀",
  "딴짓 기록은 충분해요. 이제 집중할 차례예요 🔥",
  "한 번 끊어내면 생각보다 금방 다시 몰입돼요.",
];

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatTimeKorean(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

export function getRandomMessage(arr: readonly string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateAcrosticPoem(
  categoryLabel: string,
  timeStr: string
): { char: string; line: string }[] {
  const sets = [
    [
      { char: "포", line: "포기하지 않고 다시 시작하는 것도 실력이에요" },
      { char: "치", line: `치열하게 쌓인 ${categoryLabel} ${timeStr}도 결국 기록이에요` },
      { char: "타", line: "타이머를 끄는 순간부터 다시 집중할 수 있어요" },
    ],
    [
      { char: "포", line: "포착된 시간은 외면할 수 없죠" },
      { char: "치", line: `치명적인 ${categoryLabel}의 유혹도 이제는 숫자로 보여요` },
      { char: "타", line: "타협은 여기까지, 이제는 공부할 시간이에요" },
    ],
  ];

  return sets[Math.floor(Math.random() * sets.length)];
}
