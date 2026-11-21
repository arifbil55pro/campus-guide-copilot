import crypto from "node:crypto";

export function verifyDeviceSecret(providedSecret) {
  const expectedSecret = process.env.RFID_DEVICE_SECRET;

  if (!providedSecret || !expectedSecret) {
    return false;
  }

  const provided = Buffer.from(providedSecret);
  const expected = Buffer.from(expectedSecret);

  return (
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected)
  );
}
