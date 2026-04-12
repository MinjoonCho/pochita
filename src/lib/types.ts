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
  year: string; // '1?숇뀈', '2?숇뀈', '3?숇뀈', '4?숇뀈', '??숈썝', '議몄뾽??
  avatarEmoji: string;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  categoryId: string;
  startTime: number;
  endTime?: number;
  duration?: number; // seconds
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

export const UNIVERSITIES = [
  "?쒖슱??숆탳", "?곗꽭??숆탳", "怨좊젮??숆탳", "?깃퇏愿??숆탳", "?쒖뼇??숆탳",
  "以묒븰??숆탳", "寃쏀씗??숆탳", "?댄솕?ъ옄??숆탳", "?쒓컯??숆탳", "嫄닿뎅??숆탳",
  "?숆뎅??숆탳", "?띿씡??숆탳", "?숇챸?ъ옄??숆탳", "援????숆탳", "?몄쥌??숆탳",
  "?④뎅??숆탳", "?꾩＜??숆탳", "?명븯??숆탳", "遺?곕??숆탳", "寃쎈턿??숆탳",
  "?꾨궓??숆탳", "異⑸궓??숆탳", "KAIST", "POSTECH", "UNIST",
  "愿묒슫??숆탳", "紐낆???숆탳", "?곷챸??숆탳", "?뺤꽦?ъ옄??숆탳", "?쒖슱?쒕┰??숆탳",
  "?쒓뎅?멸뎅?대??숆탳", "?쒖슱?ъ옄??숆탳", "媛?⑤┃??숆탳", "?깆떊?ъ옄??숆탳", "?쇱쑁??숆탳",
  "寃쎄린??숆탳", "?섏썝??숆탳", "?몄쿇??숆탳", "媛泥쒕??숆탳", "?쒓뎅??났??숆탳",
];

export type TabId = "home" | "groups" | "ranking" | "stats" | "more";
