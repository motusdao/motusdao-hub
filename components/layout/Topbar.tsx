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
  LogOut,
  Copy,
  Check,
  Monitor,
  Zap
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPortal } from 'react-dom'

export function Topbar() {
  const { 
    role, 
    setRole, 
    sidebarOpen, 
    setSidebarOpen, 
    theme, 
    setTheme
  } = useUIStore()
  
  // Privy authentication hooks
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const roleButtonRef = useRef<HTMLButtonElement>(null)

  const handleRoleChange = (newRole: 'usuario' | 'psm') => {
    setRole(newRole)
    setShowRoleDropdown(false)
  }

  const handleRoleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowRoleDropdown(false)
    }
  }

  // Calculate dropdown position
  useEffect(() => {
    if (showRoleDropdown && roleButtonRef.current) {
      const rect = roleButtonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [showRoleDropdown])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'matrix') => {
    setTheme(newTheme)
    setShowThemeDropdown(false)
  }

  const handleLogin = () => {
    login()
  }

  const handleLogout = () => {
    logout()
    setShowUserDropdown(false)
  }

  const handleCopyAddress = async () => {
    if (userAddress) {
      try {
        await navigator.clipboard.writeText(userAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy address:', err)
      }
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get the primary wallet address
  const primaryWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
  const userAddress = primaryWallet?.address || user?.wallet?.address

  return (
    <header className="fixed top-4 left-0 right-0 z-40 mx-2 sm:mx-4 lg:ml-64 lg:mr-4 glass-navbar max-w-full">
      <div className="flex h-12 sm:h-16 items-center justify-between px-3 sm:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Role Selector */}
          <div className="relative">
            <button
              ref={roleButtonRef}
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="relative min-w-[132px] rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-4 h-10 flex items-center gap-2 hover:bg-white/15 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              aria-label="Selector de rol"
            >
              <span className="text-xs sm:text-sm font-medium capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            </button>

            {showRoleDropdown && createPortal(
              <>
                {/* Portal backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowRoleDropdown(false)}
                />
                {/* Dropdown content */}
                <div className="fixed z-50 min-w-[132px] rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-1"
                     style={{
                       top: `${dropdownPosition.top}px`,
                       right: `${dropdownPosition.right}px`
                     }}
                     onKeyDown={handleRoleKeyDown}>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleRoleChange('usuario')}
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-sm text-foreground/90 hover:bg-white/10 hover:text-foreground cursor-pointer focus:bg-white/15 focus:outline-none transition-colors",
                        role === 'usuario' 
                          ? "bg-white/15 text-foreground" 
                          : "text-foreground/90"
                      )}
                    >
                      Usuario
                    </button>
                    <button
                      onClick={() => handleRoleChange('psm')}
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-sm text-foreground/90 hover:bg-white/10 hover:text-foreground cursor-pointer focus:bg-white/15 focus:outline-none transition-colors",
                        role === 'psm' 
                          ? "bg-white/15 text-foreground" 
                          : "text-foreground/90"
                      )}
                    >
                      PSM
                    </button>
                  </div>
                </div>
              </>,
              document.body
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Theme Toggle Dropdown */}
          <div className="relative">
          <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="p-2 hover:bg-white/15 rounded-xl transition-colors focus-ring"
              aria-label="Theme selector"
          >
            {theme === 'light' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
            ) : theme === 'dark' ? (
                <Moon className="w-5 h-5 text-blue-400" />
            ) : (
                <Zap className="w-5 h-5 text-green-500" />
            )}
          </button>

            {showThemeDropdown && (
              <div className="absolute top-full right-0 mt-2 w-20 glass-strong border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={cn(
                      "w-full flex items-center justify-center p-2 rounded-xl transition-colors",
                      theme === 'light' 
                        ? "bg-yellow-500/20" 
                        : "hover:bg-white/10"
                    )}
                    title="Light theme"
                  >
                    <Sun className="w-5 h-5 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={cn(
                      "w-full flex items-center justify-center p-2 rounded-xl transition-colors",
                      theme === 'dark' 
                        ? "bg-blue-500/20" 
                        : "hover:bg-white/10"
                    )}
                    title="Dark theme"
                  >
                    <Moon className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleThemeChange('matrix')}
                    className={cn(
                      "w-full flex items-center justify-center p-2 rounded-xl transition-colors",
                      theme === 'matrix' 
                        ? "bg-green-500/20" 
                        : "hover:bg-white/10"
                    )}
                    title="Matrix theme"
                  >
                    <Zap className="w-5 h-5 text-green-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Auth Status */}
          {authenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 glass hover:bg-white/15 rounded-xl transition-colors"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-mauve rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">Conectado</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {userAddress ? formatAddress(userAddress) : 'Wallet'}
                  </p>
                </div>
                <div className="text-left sm:hidden">
                  <p className="text-xs font-medium">Conectado</p>
                </div>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              </button>

              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 glass-strong border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <span>Dirección de wallet:</span>
                        <button
                          onClick={handleCopyAddress}
                          className="flex items-center space-x-1 text-xs hover:text-white transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-green-400" />
                              <span className="text-green-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-xs mt-1 break-all">
                        {userAddress || 'No disponible'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-white/15 rounded-xl transition-colors text-red-400"
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
              onClick={handleLogin}
              disabled={!ready}
              className="btn-primary flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium hidden sm:inline">
                {ready ? 'Conectar Wallet' : 'Cargando...'}
              </span>
              <span className="font-medium sm:hidden">
                {ready ? 'Conectar' : '...'}
              </span>
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
      {showThemeDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowThemeDropdown(false)}
        />
      )}
    </header>
  )
}
