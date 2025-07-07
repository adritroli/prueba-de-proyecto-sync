import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = process.env.PASSWORD_SECRET_KEY || "12345678901234567890123456789012"; // 32 bytes
const ivLength = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(encrypted: string): string {
  // Si no tiene el formato iv:encrypted, devolver el texto tal cual (texto plano)
  if (!encrypted || typeof encrypted !== "string" || !encrypted.includes(":")) {
    return encrypted;
  }
  const [ivHex, encryptedText] = encrypted.split(":");
  if (!ivHex || !encryptedText) return encrypted;
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
