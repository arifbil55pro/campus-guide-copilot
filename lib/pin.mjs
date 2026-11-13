import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

export async function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(pin, salt, 64);

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPin(pin, storedHash) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derivedKey = await scrypt(pin, salt, 64);
  const storedKey = Buffer.from(hash, "hex");

  return (
    storedKey.length === derivedKey.length &&
    crypto.timingSafeEqual(storedKey, derivedKey)
  );
}
