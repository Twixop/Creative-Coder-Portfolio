import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const COOKIE_NAME = "tsa_session";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const COOKIE_PATH = "/api/tsa";

function getSigningSecret(): string | null {
  return process.env.SESSION_SECRET || null;
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.TSA_PASSWORD) && Boolean(getSigningSecret());
}

function hash(value: string): Buffer {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.TSA_PASSWORD;
  if (!expected) return false;
  const a = hash(input);
  const b = hash(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function issueToken(secret: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `tsa.${exp}`;
  return `${payload}.${sign(payload, secret)}`;
}

function verifyToken(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [prefix, expStr, sig] = parts;
  if (prefix !== "tsa") return false;
  const payload = `${prefix}.${expStr}`;
  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const exp = Number(expStr);
  return Number.isFinite(exp) && Date.now() <= exp;
}

export function setSessionCookie(res: Response): boolean {
  const secret = getSigningSecret();
  if (!secret) return false;
  res.cookie(COOKIE_NAME, issueToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_TTL_MS,
    path: COOKIE_PATH,
  });
  return true;
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: COOKIE_PATH });
}

export function isAuthenticated(req: Request): boolean {
  const secret = getSigningSecret();
  if (!secret) return false;
  const token = (req.cookies as Record<string, string> | undefined)?.[COOKIE_NAME];
  return typeof token === "string" && verifyToken(token, secret);
}

export function requireTsaAuth(req: Request, res: Response, next: NextFunction): void {
  if (isAuthenticated(req)) {
    next();
    return;
  }
  res.status(401).json({ error: "Authentification requise" });
}

const attempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 10;

export function loginRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LOGIN_MAX;
}

export function resetLoginAttempts(ip: string): void {
  attempts.delete(ip);
}
