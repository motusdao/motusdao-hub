import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'usuario' | 'psm'

interface UIState {
  // Role management
  role: UserRole
  setRole: (role: UserRole) => void
  
  // Sidebar state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // Theme state
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // Auth state
  isAuthenticated: boolean
  userAddress: string | null
  setAuthState: (isAuthenticated: boolean, address?: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Role management
      role: 'usuario',
      setRole: (role) => set({ role }),
      
      // Sidebar state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Theme state
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      // Auth state
      isAuthenticated: false,
      userAddress: null,
      setAuthState: (isAuthenticated, address = null) => set({ 
        isAuthenticated, 
        userAddress: address 
      }),
    }),
    {
      name: 'motusdao-ui-storage',
      partialize: (state) => ({
        role: state.role,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)

// Navigation items based on role
export const getNavigationItems = (role: UserRole) => {
  const baseItems = [
    { name: 'Inicio', href: '/', icon: 'Home' },
    { name: 'MotusAI', href: '/motusai', icon: 'Bot' },
    { name: 'Academia', href: '/academia', icon: 'GraduationCap' },
    { name: 'Pagos', href: '/pagos', icon: 'CreditCard' },
    { name: 'Bitácora', href: '/bitacora', icon: 'BookOpen' },
    { name: 'Perfil', href: '/perfil', icon: 'User' },
  ]

  if (role === 'usuario') {
    return [
      ...baseItems.slice(0, 2),
      { name: 'Psicoterapia', href: '/psicoterapia', icon: 'Heart' },
      ...baseItems.slice(2),
    ]
  } else {
    return [
      ...baseItems.slice(0, 2),
      { name: 'Mis usuarios', href: '/mis-usuarios', icon: 'Users' },
      { name: 'Supervisión', href: '/supervision', icon: 'Eye' },
      ...baseItems.slice(2),
    ]
  }
}
