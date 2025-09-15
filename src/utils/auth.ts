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
