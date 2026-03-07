import { create } from 'zustand'

/**
 * Auth store — mock implementation for demo mode.
 *
 * TODO: Replace with Clerk or Supabase auth when configured.
 * Integration points are marked with TODO comments below.
 */
const useAuthStore = create((set) => ({
  user: null, // { id, email, name }
  isLoading: false,
  error: null,

  /**
   * Sign in with email and password.
   * TODO: Replace with Clerk signIn or Supabase auth.signInWithPassword
   */
  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Replace with real auth call
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      await new Promise((r) => setTimeout(r, 500))

      // Mock: accept any email/password for demo
      set({
        user: {
          id: 'demo-user-' + Date.now(),
          email,
          name: email.split('@')[0],
        },
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.message || 'Sign in failed', isLoading: false })
      throw err
    }
  },

  /**
   * Sign up with email and password.
   * TODO: Replace with Clerk signUp or Supabase auth.signUp
   */
  signUp: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Replace with real auth call
      // const { data, error } = await supabase.auth.signUp({ email, password })
      await new Promise((r) => setTimeout(r, 500))

      set({
        user: {
          id: 'demo-user-' + Date.now(),
          email,
          name: email.split('@')[0],
        },
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.message || 'Sign up failed', isLoading: false })
      throw err
    }
  },

  /**
   * Sign out.
   * TODO: Replace with Clerk signOut or Supabase auth.signOut
   */
  signOut: async () => {
    set({ isLoading: true })
    try {
      // TODO: Replace with real auth call
      // await supabase.auth.signOut()
      await new Promise((r) => setTimeout(r, 200))
      set({ user: null, isLoading: false, error: null })
    } catch (err) {
      set({ error: err.message || 'Sign out failed', isLoading: false })
    }
  },

  /**
   * Sign in with Google OAuth.
   * TODO: Replace with Clerk or Supabase Google OAuth flow
   */
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Replace with real OAuth
      // const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      await new Promise((r) => setTimeout(r, 500))

      set({
        user: {
          id: 'demo-google-' + Date.now(),
          email: 'demo@gmail.com',
          name: 'Demo User',
        },
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.message || 'Google sign in failed', isLoading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))

/**
 * Hook that returns auth state and methods.
 * @returns {{ user: object|null, isLoading: boolean, error: string|null, signIn, signUp, signOut, signInWithGoogle, clearError }}
 */
export default function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const signOut = useAuthStore((s) => s.signOut)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const clearError = useAuthStore((s) => s.clearError)

  return { user, isLoading, error, signIn, signUp, signOut, signInWithGoogle, clearError }
}
