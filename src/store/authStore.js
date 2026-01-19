import { create } from 'zustand'

export const useAuthStore = create((set) => ({
    username: '',
    balance: 0,
    isAuthenticated: false,
    csrfToken: '',

    setUser: (username, balance) => set({ username, balance, isAuthenticated: true }),
    
    setBalance: (balance) => set({ balance }),
    
    setCsrfToken: (token) => set({ csrfToken: token }),
    
    logout: async () => {
        try {
            await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
        } catch (error) {
            console.error('Logout error:', error)
        }
        set({ username: '', balance: 0, isAuthenticated: false, csrfToken: '' })
    },
}))

