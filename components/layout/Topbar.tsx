'use client'

import { useUIStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  Wallet,
  ChevronDown,
  LogOut
} from 'lucide-react'
import { useState } from 'react'

export function Topbar() {
  const { 
    role, 
    setRole, 
    sidebarOpen, 
    setSidebarOpen, 
    theme, 
    toggleTheme,
    isAuthenticated,
    userAddress,
    setAuthState
  } = useUIStore()
  
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const handleRoleChange = (newRole: 'usuario' | 'psm') => {
    setRole(newRole)
    setShowRoleDropdown(false)
  }

  const handleLogout = () => {
    setAuthState(false, null)
    setShowUserDropdown(false)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-card-strong border-b border-white/10">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center space-x-2 px-3 py-2 glass-card hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium capitalize">{role}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showRoleDropdown && (
              <div className="absolute top-full left-0 mt-2 w-40 glass-card-strong border border-white/10 rounded-lg shadow-lg z-50">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleRoleChange('usuario')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      role === 'usuario' 
                        ? "bg-mauve-500/20 text-mauve-400" 
                        : "hover:bg-white/10"
                    )}
                  >
                    Usuario
                  </button>
                  <button
                    onClick={() => handleRoleChange('psm')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      role === 'psm' 
                        ? "bg-mauve-500/20 text-mauve-400" 
                        : "hover:bg-white/10"
                    )}
                  >
                    PSM
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Auth Status */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 px-3 py-2 glass-card hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-mauve rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Conectado</p>
                  <p className="text-xs text-muted-foreground">
                    {userAddress ? formatAddress(userAddress) : 'Wallet'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-card-strong border border-white/10 rounded-lg shadow-lg z-50">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b border-white/10">
                      {userAddress ? formatAddress(userAddress) : 'Wallet conectada'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Desconectar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthState(true, '0x1234...5678')} // Mock auth for now
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-mauve hover:bg-gradient-to-r hover:from-mauve-600 hover:to-mauve-800 text-white rounded-lg transition-all duration-300"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Conectar Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {showRoleDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowRoleDropdown(false)}
        />
      )}
      {showUserDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </header>
  )
}
