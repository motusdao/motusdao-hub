'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  User, 
  Save,
  Edit,
  Camera,
  Shield,
  Wallet,
  Settings
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useUIStore } from '@/lib/store'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSmartAccount } from '@/lib/contexts/ZeroDevSmartWalletProvider'
import { identifyEmbeddedWallet } from '@/lib/wallet-utils'

export default function PerfilPage() {
  const { role } = useUIStore()
  
  // Privy authentication hooks
  const { authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  
  // ZeroDev smart wallet hook
  const { smartAccountAddress, isInitializing } = useSmartAccount()
  
  // Get EOA (embedded wallet from Privy)
  const embeddedWallet = identifyEmbeddedWallet(wallets)
  const eoaAddress = embeddedWallet?.address
  
  // Get email from user
  const userEmail = user?.email?.address || user?.google?.email || user?.twitter?.email || 'No disponible'
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: 'Usuario MotusDAO',
    email: 'usuario@motusdao.com',
    bio: 'Apasionado por el bienestar mental y la tecnología blockchain.',
    location: 'Ciudad de México',
    language: 'Español',
    avatarUrl: ''
  })

  const handleSave = () => {
    // Here you would save to the database
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-mauve-500 to-iris-500 rounded-xl flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Mi Perfil
                </GradientText>
                <p className="text-muted-foreground">Gestiona tu información personal</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <GlassCard className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-mauve rounded-full flex items-center justify-center mx-auto">
                      <User className="w-16 h-16 text-white" />
                    </div>
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-mauve-500 rounded-full flex items-center justify-center hover:bg-mauve-600 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Basic Info */}
                  <h2 className="text-2xl font-bold mb-2">{profileData.displayName}</h2>
                  <p className="text-muted-foreground mb-4 capitalize">{role}</p>
                  
                  {/* Account Info */}
                  {authenticated && (
                    <div className="mb-4 space-y-3">
                      {/* Email */}
                      <div className="p-3 glass-card rounded-lg">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <User className="w-4 h-4 text-mauve-500" />
                          <span className="text-xs text-muted-foreground">Email</span>
                        </div>
                        <p className="text-sm font-mono text-center break-all">
                          {userEmail}
                        </p>
                      </div>
                      
                      {/* EOA Address */}
                      {eoaAddress && (
                        <div className="p-3 glass-card rounded-lg">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <Wallet className="w-4 h-4 text-mauve-500" />
                            <span className="text-xs text-muted-foreground">EOA (Privy)</span>
                          </div>
                          <p className="text-sm font-mono text-center">
                            {eoaAddress.slice(0, 6)}...{eoaAddress.slice(-4)}
                          </p>
                          <p className="text-xs font-mono text-center text-muted-foreground mt-1 break-all">
                            {eoaAddress}
                          </p>
                        </div>
                      )}
                      
                      {/* Smart Wallet Address */}
                      {isInitializing ? (
                        <div className="p-3 glass-card rounded-lg">
                          <p className="text-xs text-muted-foreground text-center">
                            Inicializando smart wallet...
                          </p>
                        </div>
                      ) : smartAccountAddress ? (
                        <div className="p-3 glass-card rounded-lg border border-green-500/30">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-muted-foreground">Smart Wallet (ZeroDev)</span>
                          </div>
                          <p className="text-sm font-mono text-center">
                            {smartAccountAddress.slice(0, 6)}...{smartAccountAddress.slice(-4)}
                          </p>
                          <p className="text-xs font-mono text-center text-muted-foreground mt-1 break-all">
                            {smartAccountAddress}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 glass-card rounded-lg border border-yellow-500/30">
                          <p className="text-xs text-yellow-500 text-center">
                            Smart wallet no disponible
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-mauve-500">12</div>
                      <div className="text-sm text-muted-foreground">Sesiones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-mauve-500">8</div>
                      <div className="text-sm text-muted-foreground">Cursos</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <GlassCard className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Información Personal</h3>
                    <CTAButton
                      variant={isEditing ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </>
                      )}
                    </CTAButton>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nombre de Usuario</label>
                        <input
                          type="text"
                          value={profileData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          disabled={!isEditing}
                          className="w-full p-3 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={true}
                          className="w-full p-3 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent disabled:opacity-50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email gestionado por Privy
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Biografía</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full p-3 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent disabled:opacity-50 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Ubicación</label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          disabled={!isEditing}
                          className="w-full p-3 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Idioma Preferido</label>
                        <select
                          value={profileData.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          disabled={!isEditing}
                          className="w-full p-3 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent disabled:opacity-50"
                        >
                          <option value="Español">Español</option>
                          <option value="English">English</option>
                          <option value="Português">Português</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8"
              >
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <Settings className="w-6 h-6 mr-3 text-mauve-500" />
                    Configuración
                  </h3>

                  <div className="space-y-6">
                    {/* Role Preference */}
                    <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div>
                        <h4 className="font-semibold">Rol Preferido</h4>
                        <p className="text-sm text-muted-foreground">Cambia entre Usuario y PSM</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm capitalize">{role}</span>
                        <CTAButton variant="secondary" size="sm">
                          Cambiar
                        </CTAButton>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div>
                        <h4 className="font-semibold">Privacidad</h4>
                        <p className="text-sm text-muted-foreground">Controla la visibilidad de tu perfil</p>
                      </div>
                      <CTAButton variant="secondary" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Configurar
                      </CTAButton>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div>
                        <h4 className="font-semibold">Notificaciones</h4>
                        <p className="text-sm text-muted-foreground">Gestiona tus preferencias de notificación</p>
                      </div>
                      <CTAButton variant="secondary" size="sm">
                        Configurar
                      </CTAButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
