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
  "🐶", "🐱", "🐻", "🐰", "🦊", "🐼", "🐯", "🐸",
  "🐹", "🐨", "🐵", "🐧", "🦁", "🐮", "🐙", "🐤",
];

export const UNIVERSITIES = [
  "서울대학교", "연세대학교", "고려대학교", "성균관대학교", "한양대학교",
  "중앙대학교", "경희대학교", "이화여자대학교", "서강대학교", "건국대학교",
  "동국대학교", "홍익대학교", "숙명여자대학교", "국민대학교", "인하대학교",
  "아주대학교", "부산대학교", "경북대학교", "전남대학교", "충남대학교",
  "KAIST", "POSTECH", "UNIST", "광운대학교", "명지대학교",
  "상명대학교", "숭실대학교", "가천대학교", "서울시립대학교", "세종대학교",
  "단국대학교", "한국외국어대학교", "경기대학교", "수원대학교", "인천대학교",
];

export type TabId = "home" | "groups" | "ranking" | "stats" | "more";
