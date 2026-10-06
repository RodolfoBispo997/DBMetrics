import type { CookieOptions, Response } from "express";
import { REFRESH_SESSION_COOKIE } from "../user/application/use-cases/refresh-session/refresh-session.constants";

export function getRefreshSessionCookieOptions(
  ttlDays: number,
  nodeEnvironment = process.env.NODE_ENV,
): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnvironment !== "development" && nodeEnvironment !== "test",
    path: "/auth",
    maxAge: ttlDays * 24 * 60 * 60 * 1000,
  };
}

export function setRefreshSessionCookie(
  response: Response,
  refreshToken: string,
  ttlDays: number,
): void {
  response.cookie(
    REFRESH_SESSION_COOKIE,
    refreshToken,
    getRefreshSessionCookieOptions(ttlDays),
  );
}

export function clearRefreshSessionCookie(
  response: Response,
  ttlDays: number,
): void {
  const { maxAge: _maxAge, ...options } = getRefreshSessionCookieOptions(ttlDays);
  response.clearCookie(REFRESH_SESSION_COOKIE, options);
}
