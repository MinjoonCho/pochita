import { api } from "./api";
import { signInWithGoogle } from "./google-auth";
import type { ActiveTimer, Session, User } from "./types";

export const KEYS = {
  CURRENT_USER: "pochita_current_user",
  ACTIVE_TIMER: "pochita_active_timer",
  DATA_VERSION: "pochita_data_version",
} as const;

const STORE_CHANGE_EVENT = "pochita-store-change";
const rawCache = new Map<string, string | null>();

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function readRaw(key: string): string | null {
  if (!canUseStorage()) return null;
  if (rawCache.has(key)) return rawCache.get(key) ?? null;
  const value = localStorage.getItem(key);
  rawCache.set(key, value);
  return value;
}

function writeRaw(key: string, value: string | null): void {
  if (!canUseStorage()) return;
  rawCache.set(key, value);
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
  window.dispatchEvent(new Event(STORE_CHANGE_EVENT));
}

function getSingle<T>(key: string): T | null {
  try {
    const raw = readRaw(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setSingle<T>(key: string, data: T | null): void {
  writeRaw(key, data === null ? null : JSON.stringify(data));
}

function bumpDataVersion(): void {
  const current = Number(readRaw(KEYS.DATA_VERSION) ?? "0");
  writeRaw(KEYS.DATA_VERSION, String(current + 1));
}

export function subscribeToStore(onChange: () => void): () => void {
  if (!canUseStorage()) return () => undefined;

  const handleChange = () => {
    rawCache.clear();
    onChange();
  };

  window.addEventListener(STORE_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(STORE_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export function getRawSnapshot(key: string): string | null {
  return readRaw(key);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isMissingUserError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("사용자를 찾을 수 없습니다.");
}

export const AuthStore = {
  async register(
    email: string,
    password: string,
    profile: Pick<User, "nickname" | "university" | "major" | "year" | "avatarEmoji">
  ): Promise<User> {
    const user = await api.register({
      email: normalizeEmail(email),
      password,
      ...profile,
    });
    setSingle(KEYS.CURRENT_USER, user);
    bumpDataVersion();
    return user;
  },

  async login(email: string, password: string): Promise<User> {
    const user = await api.login({ email: normalizeEmail(email), password });
    setSingle(KEYS.CURRENT_USER, user);
    bumpDataVersion();
    return user;
  },

  async loginWithGoogle(): Promise<User> {
    const user = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      ? await signInWithGoogle().then((profile) =>
          api.loginWithGoogleProfile({
            email: normalizeEmail(profile.email),
            name: profile.name,
            googleId: profile.sub,
          })
        )
      : await api.loginWithGoogleDemo();

    setSingle(KEYS.CURRENT_USER, user);
    bumpDataVersion();
    return user;
  },

  logout(): void {
    setSingle(KEYS.CURRENT_USER, null);
    setSingle(KEYS.ACTIVE_TIMER, null);
    bumpDataVersion();
  },

  getCurrentUser(): User | null {
    return getSingle<User>(KEYS.CURRENT_USER);
  },

  async refreshCurrentUser(): Promise<User | null> {
    const currentUser = getSingle<User>(KEYS.CURRENT_USER);
    if (!currentUser) return null;

    try {
      const user = await api.getUser(currentUser.id);
      setSingle(KEYS.CURRENT_USER, user);
      return user;
    } catch (error) {
      if (isMissingUserError(error)) {
        setSingle(KEYS.CURRENT_USER, null);
        setSingle(KEYS.ACTIVE_TIMER, null);
        bumpDataVersion();
        return null;
      }

      return currentUser;
    }
  },

  async updateCurrentUser(updates: Pick<User, "nickname" | "university" | "major" | "year" | "avatarEmoji">): Promise<User | null> {
    const currentUser = getSingle<User>(KEYS.CURRENT_USER);
    if (!currentUser) return null;

    try {
      const user = await api.updateUser(currentUser.id, updates);
      setSingle(KEYS.CURRENT_USER, user);
      bumpDataVersion();
      return user;
    } catch (error) {
      if (isMissingUserError(error)) {
        setSingle(KEYS.CURRENT_USER, null);
        setSingle(KEYS.ACTIVE_TIMER, null);
        bumpDataVersion();
        throw new Error("로그인 정보가 만료되었어요. 다시 로그인해주세요.");
      }

      throw error;
    }
  },
};

export const SessionStore = {
  async create(userId: string, categoryId: string): Promise<Session> {
    const session = await api.startSession({
      userId,
      categoryId,
    });
    bumpDataVersion();
    return session;
  },

  async finish(sessionId: string, note?: string): Promise<Session> {
    const session = await api.finishSession(sessionId, note);
    bumpDataVersion();
    return session;
  },
};

export const TimerStore = {
  start(sessionId: string, userId: string, categoryId: string): ActiveTimer {
    const timer: ActiveTimer = {
      sessionId,
      userId,
      categoryId,
      startTime: Date.now(),
      isPaused: false,
      totalPausedSeconds: 0,
    };

    setSingle(KEYS.ACTIVE_TIMER, timer);
    return timer;
  },

  get(): ActiveTimer | null {
    return getSingle<ActiveTimer>(KEYS.ACTIVE_TIMER);
  },

  pause(): void {
    const timer = getSingle<ActiveTimer>(KEYS.ACTIVE_TIMER);
    if (!timer || timer.isPaused) return;
    setSingle(KEYS.ACTIVE_TIMER, { ...timer, isPaused: true, pausedAt: Date.now() });
  },

  resume(): void {
    const timer = getSingle<ActiveTimer>(KEYS.ACTIVE_TIMER);
    if (!timer || !timer.isPaused) return;

    const pausedSeconds = timer.pausedAt
      ? Math.floor((Date.now() - timer.pausedAt) / 1000)
      : 0;

    setSingle(KEYS.ACTIVE_TIMER, {
      ...timer,
      isPaused: false,
      pausedAt: undefined,
      totalPausedSeconds: timer.totalPausedSeconds + pausedSeconds,
    });
  },

  clear(): void {
    setSingle(KEYS.ACTIVE_TIMER, null);
  },

  getElapsedSeconds(timer: ActiveTimer): number {
    const now = Date.now();
    const totalSeconds = Math.floor((now - timer.startTime) / 1000);
    const pausedSeconds = timer.isPaused
      ? timer.totalPausedSeconds +
        (timer.pausedAt ? Math.floor((now - timer.pausedAt) / 1000) : 0)
      : timer.totalPausedSeconds;
    return Math.max(0, totalSeconds - pausedSeconds);
  },
};

export const GroupStore = {
  async create(
    name: string,
    description: string,
    emoji: string,
    createdBy: string,
    isPublic: boolean,
    password = ""
  ) {
    const group = await api.createGroup({
      name,
      description,
      emoji,
      createdBy,
      isPublic,
      password,
    });
    bumpDataVersion();
    return group;
  },

  async joinByInviteCode(inviteCode: string, userId: string, password = "") {
    const group = await api.joinGroup({
      inviteCode: inviteCode.trim().toUpperCase(),
      userId,
      password,
    });
    bumpDataVersion();
    return group;
  },

  async regenerateInviteCode(groupId: string) {
    const group = await api.regenerateInviteCode(groupId);
    bumpDataVersion();
    return group.inviteCode;
  },

  async removeMember(groupId: string, actorUserId: string, targetUserId: string) {
    const groupDetail = await api.removeGroupMember(groupId, { actorUserId, targetUserId });
    bumpDataVersion();
    return groupDetail;
  },
};
