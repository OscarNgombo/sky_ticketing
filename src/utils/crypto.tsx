import CryptoJS from "crypto-js";

const SECRET_KEY = "skyworld_ticket_secret_2025";

// Encrypt data
export function encryptData(data: string | object, secret: string = SECRET_KEY): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, secret).toString();
}

// Decrypt data
export function decryptData(
  encrypted: string,
  secret: string = SECRET_KEY
): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

// Hash password
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

// Compare password
export function comparePassword(input: string, storedHash: string): boolean {
  return hashPassword(input) === storedHash;
}
