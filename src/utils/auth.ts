import { decryptData } from './crypto'

export type CurrentUser = {
  username: string
  userType: string
  company: string
}

const LOGGED_IN_KEY = 'loggedInUser'

export function getCurrentUser(): CurrentUser | null {
  try {
    const enc = localStorage.getItem(LOGGED_IN_KEY)
    if (!enc) return null
    const dec = decryptData(enc)
    if (!dec) return null
    const obj = JSON.parse(dec)
    if (obj && typeof obj.username === 'string') return obj as CurrentUser
    return null
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null
}

export function logout(): void {
  try {
    localStorage.removeItem(LOGGED_IN_KEY)
  } catch {
    // ignore
  }
}

/**
 * Encodes a ticket ID for URL safety using base64 and URI encoding
 * @param ticketId - The ticket ID to encode
 * @returns The encoded ticket ID safe for URL parameters
 */
export function encodeTicketId(ticketId: string | number): string {
  return encodeURIComponent(btoa(String(ticketId)))
}

/**
 * Decodes a ticket ID from URL parameter
 * @param encodedTicketId - The encoded ticket ID from URL
 * @returns The original ticket ID
 */
export function decodeTicketId(encodedTicketId: string): string {
  try {
    const decodedUri = decodeURIComponent(String(encodedTicketId))
    try {
      const decodedBase64 = atob(decodedUri)
      return decodedBase64 || decodedUri
    } catch {
      return decodedUri
    }
  } catch {
    return String(encodedTicketId)
  }
}
