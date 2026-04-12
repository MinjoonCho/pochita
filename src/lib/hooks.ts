"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, type CategoryRankingEntry, type GroupDetailResponse, type RankingEntry, type UserStatsResponse } from "@/lib/api";
import { AuthStore, KEYS, getRawSnapshot, subscribeToStore } from "@/lib/store";
import { isUserProfileIncomplete, type ActiveTimer, type Group, type Session, type User } from "@/lib/types";

function parseSnapshot<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function useStoredValue<T>(key: string, fallback: T): T {
  const raw = useSyncExternalStore(
    subscribeToStore,
    () => getRawSnapshot(key),
    () => null
  );

  return parseSnapshot(raw, fallback);
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
}

export function useAuthUser(): User | null {
  return useStoredValue<User | null>(KEYS.CURRENT_USER, null);
}

export function useSessions(): Session[] {
  const user = useAuthUser();
  return useApiResource(
    () => (user ? api.getUserSessions(user.id) : Promise.resolve([])),
    [],
    [user?.id]
  );
}

export function useGroups(): Group[] {
  const user = useAuthUser();
  return useApiResource(
    () => (user ? api.getGroups(user.id) : Promise.resolve([])),
    [],
    [user?.id]
  );
}

export function useActiveTimer(): ActiveTimer | null {
  return useStoredValue<ActiveTimer | null>(KEYS.ACTIVE_TIMER, null);
}

export function useGroupDetail(groupId: string | null): GroupDetailResponse | null {
  const user = useAuthUser();
  return useApiResource(
    () => (user && groupId ? api.getGroup(groupId) : Promise.resolve(null)),
    null,
    [user?.id, groupId]
  );
}

export function useRankings() {
  const user = useAuthUser();
  return useApiResource(
    async () => {
      if (!user) {
        return {
          universityRanking: [] as RankingEntry[],
          groupRanking: [] as RankingEntry[],
          personalRanking: [] as RankingEntry[],
          categoryRanking: [] as CategoryRankingEntry[],
        };
      }

      const [universityRanking, groupRanking, personalRanking, categoryRanking] = await Promise.all([
        api.getUniversityRanking(),
        api.getGroupRanking(),
        api.getUserRanking(),
        api.getCategoryRanking(),
      ]);

      return { universityRanking, groupRanking, personalRanking, categoryRanking };
    },
    {
      universityRanking: [] as RankingEntry[],
      groupRanking: [] as RankingEntry[],
      personalRanking: [] as RankingEntry[],
      categoryRanking: [] as CategoryRankingEntry[],
    },
    [user?.id]
  );
}

export function useUserStats(userId?: string): UserStatsResponse | null {
  return useApiResource(
    () => (userId ? api.getUserStats(userId) : Promise.resolve(null)),
    null,
    [userId]
  );
}

function useApiResource<T>(loader: () => Promise<T>, fallback: T, deps: Array<string | number | null | undefined> = []): T {
  const version = useStoredValue<string>(KEYS.DATA_VERSION, "0");
  const [data, setData] = useState<T>(fallback);
  const loaderRef = useRef(loader);
  const fallbackRef = useRef(fallback);
  const depKey = JSON.stringify(deps);

  useEffect(() => {
    loaderRef.current = loader;
    fallbackRef.current = fallback;
  }, [fallback, loader]);

  useEffect(() => {
    let cancelled = false;

    loaderRef.current()
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch(() => {
        if (!cancelled) setData(fallbackRef.current);
      });

    return () => {
      cancelled = true;
    };
  }, [depKey, version]);

  return data;
}

export function useRequireAuth(): User | null {
  const router = useRouter();
  const user = useAuthUser();
  const pathname = usePathname();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!user) return;
    void AuthStore.refreshCurrentUser();
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      const query = typeof window === "undefined" ? "" : window.location.search.slice(1);
      const nextPath = query ? `${pathname}?${query}` : pathname;
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (isUserProfileIncomplete(user) && pathname !== "/signup/detail") {
      const query = typeof window === "undefined" ? "" : window.location.search.slice(1);
      const nextPath = query ? `${pathname}?${query}` : pathname;
      router.replace(`/signup/detail?completeProfile=1&next=${encodeURIComponent(nextPath)}`);
    }
  }, [hydrated, pathname, router, user]);

  return hydrated ? user : null;
}

export function useRedirectIfAuth(): void {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthUser();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;

    if (user && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
      const nextPath = typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("next");
      router.replace(isUserProfileIncomplete(user) ? "/signup/detail?completeProfile=1" : (nextPath ?? "/home"));
    }
  }, [hydrated, pathname, router, user]);
}
