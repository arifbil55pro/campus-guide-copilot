import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "navipus_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET belum dikonfigurasi.");
  }

  return secret;
}

function signPayload(payload) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionValue(studentId) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${studentId}.${expiresAt}`;
  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionValue(value) {
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [studentId, expiresAt, signature] = parts;
  const payload = `${studentId}.${expiresAt}`;
  const expectedSignature = signPayload(payload);
  const receivedSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    receivedSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(receivedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  if (!Number.isInteger(Number(studentId)) || Number(expiresAt) < Date.now() / 1000) {
    return null;
  }

  return Number(studentId);
}

export async function getSessionStudentId() {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function setSession(studentId) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, createSessionValue(studentId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
