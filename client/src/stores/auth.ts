import { create } from 'zustand'
import type { LoginResponse } from '@app/shared'

/**
 * Local storage keys for persisting session data across page reloads
 */
const TOKEN_KEY = 'token'
const NICKNAME_KEY = 'nickname'
const USER_ID_KEY = 'userId'

/**
 * Shape of the authentication state and available actions
 */
type AuthState = {
  token: string
  nickname: string | null
  userId: string | null
  setSession: (session: LoginResponse) => void
  logout: () => void
}

/**
 * Zustand store for handling user authentication
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Initialize state from local storage to keep the user logged in on refresh
  token: localStorage.getItem(TOKEN_KEY) ?? '',
  nickname: localStorage.getItem(NICKNAME_KEY),
  userId: localStorage.getItem(USER_ID_KEY),

  setSession: ({ token, nickname, userId }) => {
    // Persist credentials to local storage
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(NICKNAME_KEY, nickname)
    localStorage.setItem(USER_ID_KEY, userId)

    // Update store state
    set({ token, nickname, userId })
  },

  logout: () => {
    // Remove credentials from local storage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NICKNAME_KEY)
    localStorage.removeItem(USER_ID_KEY)

    // Reset store state to initial empty values
    set({ token: '', nickname: null, userId: null })
  },
}))

/**
 * Simple selector to check if a valid session exists in the state
 */
export const selectIsAuthenticated = (state: AuthState) =>
  Boolean(state.token && state.nickname)
