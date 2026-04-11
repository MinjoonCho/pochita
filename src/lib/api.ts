import type { Group, Session, User } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export interface RankingEntry {
  id: string;
  name: string;
  emoji?: string | null;
  sec: number;
  minutes: number;
  memberCount: number;
}

export interface CategoryRankingEntry {
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  winnerUserId?: string | null;
  winnerName?: string | null;
  winnerEmoji?: string | null;
  sec: number;
  minutes: number;
}

export interface GroupMemberDetail {
  userId: string;
  nickname: string;
  university: string;
  major: string;
  avatarEmoji: string;
  role: "owner" | "member";
  joinedAt: number;
  todaySec: number;
  totalSec: number;
}

export interface GroupDetailResponse {
  group: Group;
  members: GroupMemberDetail[];
}

export interface UserStatsResponse {
  userId: string;
  todaySec: number;
  totalSec: number;
  averageSec: number;
  maxSessionSec: number;
  categoryBreakdown: Array<{
    categoryId: string;
    seconds: number;
    minutes: number;
  }>;
  weeklyBreakdown: Array<{
    label: string;
    seconds: number;
  }>;
}

type RequestInitWithJson = RequestInit & {
  body?: BodyInit | null;
};

async function requestJson<T>(path: string, init?: RequestInitWithJson): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }
    throw new Error(payload?.message ?? payload?.error ?? "서버 요청에 실패했습니다.");
  }

  return (await response.json()) as T;
}

export const api = {
  register(payload: {
    email: string;
    password: string;
    nickname: string;
    university: string;
    major: string;
    year: string;
    avatarEmoji: string;
  }) {
    return requestJson<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: { email: string; password: string }) {
    return requestJson<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  loginWithGoogleProfile(payload: { email: string; name: string; googleId: string }) {
    return requestJson<User>("/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  loginWithGoogleDemo() {
    return requestJson<User>("/auth/google-demo", {
      method: "POST",
    });
  },

  getUser(userId: string) {
    return requestJson<User>(`/users/${userId}`);
  },

  updateUser(userId: string, payload: {
    nickname: string;
    university: string;
    major: string;
    year: string;
    avatarEmoji: string;
  }) {
    return requestJson<User>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getGroups(userId: string) {
    return requestJson<Group[]>(`/groups?userId=${encodeURIComponent(userId)}`);
  },

  getGroup(groupId: string) {
    return requestJson<GroupDetailResponse>(`/groups/${groupId}`);
  },

  createGroup(payload: {
    name: string;
    description: string;
    emoji: string;
    createdBy: string;
    isPublic: boolean;
    password?: string;
  }) {
    return requestJson<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  joinGroup(payload: { inviteCode: string; userId: string; password?: string }) {
    return requestJson<Group>("/groups/join", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  regenerateInviteCode(groupId: string) {
    return requestJson<Group>(`/groups/${groupId}/invite-code`, {
      method: "POST",
    });
  },

  removeGroupMember(groupId: string, payload: { actorUserId: string; targetUserId: string }) {
    return requestJson<GroupDetailResponse>(`/groups/${groupId}/remove-member`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  startSession(payload: { userId: string; categoryId: string }) {
    return requestJson<Session>("/sessions/start", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  finishSession(sessionId: string, note?: string) {
    return requestJson<Session>(`/sessions/${sessionId}/finish`, {
      method: "POST",
      body: JSON.stringify(note ? { note } : {}),
    });
  },

  getUserSessions(userId: string) {
    return requestJson<Session[]>(`/sessions/users/${userId}`);
  },

  getUniversityRanking() {
    return requestJson<RankingEntry[]>("/rankings/universities");
  },

  getGroupRanking() {
    return requestJson<RankingEntry[]>("/rankings/groups");
  },

  getUserRanking() {
    return requestJson<RankingEntry[]>("/rankings/users");
  },

  getCategoryRanking() {
    return requestJson<CategoryRankingEntry[]>("/rankings/categories");
  },

  getUserStats(userId: string) {
    return requestJson<UserStatsResponse>(`/stats/users/${userId}`);
  },
};
