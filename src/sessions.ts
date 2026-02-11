import type { Session } from "./types";

const STORAGE_KEY = "roblox-manager-sessions";

export function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: Session[] = JSON.parse(raw);
    return sessions.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch {
    return [];
  }
}

export function saveSession(session: Omit<Session, "id" | "lastUsed">): Session {
  const sessions = getSessions();
  const existing = sessions.find(
    (s) => s.universeId === session.universeId && s.apiKey === session.apiKey
  );

  if (existing) {
    existing.experienceName = session.experienceName;
    existing.lastUsed = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return existing;
  }

  const newSession: Session = {
    ...session,
    id: crypto.randomUUID(),
    lastUsed: Date.now(),
  };
  sessions.push(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return newSession;
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
