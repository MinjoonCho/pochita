import type { Session } from "./types";

function isCompletedSession(session: Session): session is Session & Required<Pick<Session, "endTime" | "duration">> {
  return typeof session.endTime === "number" && typeof session.duration === "number";
}

function getStartOfToday(timestamp = Date.now()): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function getCompletedSessions(sessions: Session[]): Array<Session & Required<Pick<Session, "endTime" | "duration">>> {
  return sessions.filter(isCompletedSession);
}

export function getUserSessions(sessions: Session[], userId: string): Session[] {
  return getCompletedSessions(sessions).filter((session) => session.userId === userId);
}

export function getTodaySessions(sessions: Session[], userId: string, now = Date.now()): Session[] {
  const startOfToday = getStartOfToday(now);
  return getUserSessions(sessions, userId).filter((session) => session.startTime >= startOfToday);
}

export function getTotalSeconds(sessions: Session[]): number {
  return getCompletedSessions(sessions).reduce((total, session) => total + session.duration, 0);
}
