// ==============================
// Core Types for Pochita App
// ==============================

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  authProvider?: "credentials" | "google";
  nickname: string;
  university: string;
  major: string;
  year: string;
  avatarEmoji: string;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  categoryId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  note?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  emoji: string;
  createdBy: string;
  inviteCode: string;
  createdAt: number;
  isPublic: boolean;
  requiresPassword: boolean;
  passwordHash?: string;
  memberCount?: number;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  joinedAt: number;
  role: "owner" | "member";
}

export interface ActiveTimer {
  sessionId: string;
  userId: string;
  categoryId: string;
  startTime: number;
  isPaused: boolean;
  pausedAt?: number;
  totalPausedSeconds: number;
}

const INCOMPLETE_PROFILE_VALUES = new Set([
  "",
  "학교 미설정",
  "전공 미설정",
  "학년 미설정",
]);

export function isUserProfileIncomplete(user: User | null | undefined): boolean {
  if (!user) return false;

  return (
    INCOMPLETE_PROFILE_VALUES.has(user.university.trim()) ||
    INCOMPLETE_PROFILE_VALUES.has(user.major.trim()) ||
    INCOMPLETE_PROFILE_VALUES.has(user.year.trim())
  );
}

export const YEARS = ["1학년", "2학년", "3학년", "4학년", "대학원", "졸업생"];

export const AVATAR_EMOJIS = [
  "🐶", "🐱", "🐻", "🐰",
  "🦊", "🐼", "🐯", "🐸",
  "🐹", "🐨", "🐵", "🐧",
  "🦁", "🐮", "🐙", "🐤",
];

const UNIVERSITY_NORMALIZATION_MAP = new Map<string, string>([
  ["서울대", "서울대학교"],
  ["경희대", "경희대학교"],
  ["연세대", "연세대학교(서울)"],
  ["연세대학교", "연세대학교(서울)"],
  ["고려대", "고려대학교(서울)"],
  ["고려대학교", "고려대학교(서울)"],
  ["명지대", "명지대학교(자연)"],
  ["명지대학교", "명지대학교(자연)"],
  ["명지대(인문)", "명지대학교(인문)"],
  ["명지대(자연)", "명지대학교(자연)"],
  ["상명대", "상명대학교(서울)"],
  ["상명대학교", "상명대학교(서울)"],
  ["상명대(서울)", "상명대학교(서울)"],
  ["상명대(천안)", "상명대학교(천안)"],
  ["한국외대", "한국외국어대학교"],
  ["한국외국어대학교", "한국외국어대학교"],
  ["한국외대(글로벌)", "한국외국어대학교(글로벌)"],
]);

export const UNIVERSITIES = [
  "서울대학교",
  "연세대학교(서울)",
  "연세대학교(미래)",
  "고려대학교(서울)",
  "고려대학교(세종)",
  "성균관대학교",
  "한양대학교",
  "중앙대학교",
  "경희대학교",
  "이화여자대학교",
  "서강대학교",
  "건국대학교",
  "동국대학교",
  "홍익대학교",
  "숙명여자대학교",
  "국민대학교",
  "인하대학교",
  "아주대학교",
  "부산대학교",
  "경북대학교",
  "전남대학교",
  "충남대학교",
  "KAIST",
  "POSTECH",
  "UNIST",
  "광운대학교",
  "명지대학교(인문)",
  "명지대학교(자연)",
  "상명대학교(서울)",
  "상명대학교(천안)",
  "숭실대학교",
  "가천대학교",
  "서울시립대학교",
  "세종대학교",
  "단국대학교",
  "한국외국어대학교",
  "한국외국어대학교(글로벌)",
  "경기대학교",
  "수원대학교",
  "인천대학교",
  "경상국립대학교",
  "경성대학교",
  "공주대학교(천안)",
  "금오공과대학교",
  "순천대학교",
  "국립창원대학교",
  "덕성여자대학교",
  "동덕여자대학교",
  "대구대학교",
  "동아대학교",
  "백석대학교",
  "삼육대학교",
  "서경대학교",
  "서울과학기술대학교",
  "서울여자대학교",
  "서울예술대학교",
  "성결대학교",
  "성공회대학교",
  "성신여자대학교",
  "서일대학교",
  "선문대학교",
  "순천향대학교",
  "영남대학교",
  "을지대학교",
  "신한대학교",
  "연암공과대학교",
  "우송대학교",
  "중부대학교",
  "청주대학교",
  "한국교통대학교",
  "한국항공대학교",
  "한남대학교",
  "한동대학교",
  "한밭대학교",
  "한서대학교",
  "한성대학교",
  "한림대학교",
  "제주대학교",
  "인하공업전문대학교",
  "태재대학교",
  "평택대학교",
  "한국공학대학교",
  "전북대학교",
  "한국기술교육대학교",
  "충북대학교",
  "호서대학교",
  "가톨릭대학교",
  "강남대학교",
  "계명대학교",
];

const UNIVERSITY_SEARCH_ALIASES = new Map<string, string[]>([
  ["서울대학교", ["서울대"]],
  ["경희대학교", ["경희대"]],
  ["연세대학교(서울)", ["연세대", "연세대학교"]],
  ["연세대학교(미래)", ["연세대(미래)"]],
  ["고려대학교(서울)", ["고려대", "고려대학교"]],
  ["고려대학교(세종)", ["고려대(세종)"]],
  ["명지대학교(인문)", ["명지대(인문)"]],
  ["명지대학교(자연)", ["명지대", "명지대학교", "명지대(자연)"]],
  ["상명대학교(서울)", ["상명대", "상명대학교", "상명대(서울)"]],
  ["상명대학교(천안)", ["상명대(천안)"]],
  ["한국외국어대학교", ["한국외대", "한국외국어대학교"]],
  ["한국외국어대학교(글로벌)", ["한국외대(글로벌)"]],
]);

export function normalizeUniversityName(university: string): string {
  const normalized = university.trim();
  return UNIVERSITY_NORMALIZATION_MAP.get(normalized) ?? normalized;
}

export function matchesUniversityQuery(university: string, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const candidates = [university, ...(UNIVERSITY_SEARCH_ALIASES.get(university) ?? [])];
  return candidates.some((candidate) => candidate.toLowerCase().includes(normalizedQuery));
}

export type TabId = "home" | "groups" | "ranking" | "stats" | "more";
