'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Section } from '@/components/ui/Section'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { Video, RefreshCcw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type JitsiInitOptions = {
  roomName?: string
  room?: string
  url?: string
  parentNode: HTMLElement
  width?: string | number
  height?: string | number
  jwt?: string
  serverURL?: string
  protocol?: string
  scheme?: string
  configOverwrite?: Record<string, unknown>
  interfaceConfigOverwrite?: Record<string, unknown>
}

type JitsiExternalAPI = {
  dispose: () => void
  // We only use a tiny subset of the API in this page; the rest is left as unknown
  [key: string]: unknown
}

type JitsiExternalAPIConstructor = new (
  domainOrUrl: string,
  options: JitsiInitOptions,
) => JitsiExternalAPI

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiExternalAPIConstructor
  }
}

const JITSI_DEFAULT_DOMAIN =
  process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
const JITSI_ROOM_PREFIX =
  process.env.NEXT_PUBLIC_JITSI_ROOM_PREFIX || 'motusdao-demo-'

// Determine protocol based on domain (http for localhost, https for others)
// Also handles cases where domain already includes protocol
const getJitsiProtocol = (domain: string) => {
  // If domain already has a protocol, extract it
  if (domain.includes('://')) {
    const url = new URL(domain)
    return url.protocol.replace(':', '') // Remove the colon
  }
  // Otherwise, determine based on domain
  return domain.includes('localhost') || domain.includes('127.0.0.1') ? 'http' : 'https'
}

function buildFallbackRoom() {
  // Sala pseudo-aleatoria para pruebas manuales si no se pasa nada por query
  const slug = Math.random().toString(36).substring(2, 10)
  return `${JITSI_ROOM_PREFIX}${slug}`
}

function VideochatInner() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isJitsiReady, setIsJitsiReady] = useState(false)
  const [api, setApi] = useState<JitsiExternalAPI | null>(null)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [roomInfo, setRoomInfo] = useState<{ domain: string; roomName: string } | null>(null)
  const [jwtToken, setJwtToken] = useState<string | null>(null)
  const [isLoadingToken, setIsLoadingToken] = useState(false)
  const searchParams = useSearchParams()

  // Resolver dominio y roomName sólo en el cliente para evitar mismatches de SSR
  useEffect(() => {
    const roomFromQuery = searchParams.get('room') || undefined
    const urlFromQuery = searchParams.get('url') || undefined

    // Si llega una URL completa de Jitsi (por ejemplo desde /api/sessions.externalUrl), la usamos tal cual
    // si no, construimos un roomName contra el dominio configurado
    if (urlFromQuery) {
      try {
        const parsed = new URL(urlFromQuery)
        setRoomInfo({
          domain: parsed.host,
          roomName: parsed.pathname.replace(/^\//, '') || buildFallbackRoom(),
        })
        return
      } catch {
        // Si la URL es inválida, caemos al dominio configurado y room de fallback
        setRoomInfo({
          domain: JITSI_DEFAULT_DOMAIN,
          roomName: roomFromQuery || buildFallbackRoom(),
        })
        return
      }
    }

    setRoomInfo({
      domain: JITSI_DEFAULT_DOMAIN,
      roomName: roomFromQuery || buildFallbackRoom(),
    })
  }, [searchParams])

  // Fallback: si el script carga pero onReady no se dispara por alguna razón,
  // revisamos periódicamente si window.JitsiMeetExternalAPI existe
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkLibrary = () => {
      if (window.JitsiMeetExternalAPI && !isJitsiReady) {
        setIsJitsiReady(true)
      }
    }

    const interval = setInterval(checkLibrary, 500)
    checkLibrary()

    return () => clearInterval(interval)
  }, [isJitsiReady])

  // Fetch JWT token if JWT is enabled
  useEffect(() => {
    if (!roomInfo) return

    const fetchJwtToken = async () => {
      setIsLoadingToken(true)
      try {
        const response = await fetch('/api/jitsi/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: roomInfo.roomName,
            userId: 'user', // TODO: Get from auth context
            userName: 'Usuario',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.token) {
            setJwtToken(data.token)
            console.log('✅ JWT token generado correctamente')
          }
        } else {
          // If JWT is not configured, that's okay - we'll use unauthenticated mode
          const errorData = await response.json().catch(() => ({}))
          console.warn('⚠️ JWT token no disponible:', errorData.error || 'usando modo sin autenticación')
          setJwtToken(null)
        }
      } catch (error) {
        console.error('Error fetching JWT token:', error)
        setJwtToken(null)
      } finally {
        setIsLoadingToken(false)
      }
    }

    // Only fetch token if JWT is enabled (check if env vars are set)
    // In production, you might want to always try to fetch it
    fetchJwtToken()
  }, [roomInfo])

  useEffect(() => {
    if (!isJitsiReady) return
    if (!roomInfo) return
    if (!containerRef.current) return
    if (!window.JitsiMeetExternalAPI) return
    // Wait for token to load (or skip if not using JWT)
    if (isLoadingToken) return

    // Limpia instancias previas si se re-renderiza
    if (api) {
      api.dispose()
    }

    // Extract domain and protocol properly - handle both "localhost:8080" and full URLs
    let jitsiDomain: string
    let protocol: string
    
    if (roomInfo.domain.includes('://')) {
      // If it's already a full URL, extract both protocol and host
      const url = new URL(roomInfo.domain)
      protocol = url.protocol.replace(':', '') // Remove the colon (http: -> http)
      jitsiDomain = url.host // This includes port if present (localhost:8080)
    } else {
      // If it's just "localhost:8080" or similar, determine protocol
      protocol = getJitsiProtocol(roomInfo.domain)
      jitsiDomain = roomInfo.domain
    }

    // Build the full room URL with correct protocol
    // Ensure we don't double up on protocol
    const fullRoomUrl = `${protocol}://${jitsiDomain}/${roomInfo.roomName}`

    console.log('🔍 Jitsi Config:', { 
      domain: jitsiDomain, 
      protocol, 
      roomName: roomInfo.roomName,
      fullRoomUrl,
      jwtToken: jwtToken ? `${jwtToken.substring(0, 20)}...` : 'none',
      isJitsiReady,
      isLoadingToken
    })
    console.log('🔍 Full Room URL:', fullRoomUrl)

    const options: JitsiInitOptions = {
      // Don't use roomName when passing full URL
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      ...(jwtToken && { jwt: jwtToken }),
      configOverwrite: {
        // Enable longer sessions (remove 5-minute limit)
        // This requires a self-hosted Jitsi server
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        // Remove time limits
        maxDuration: 0, // 0 = unlimited
      },
      interfaceConfigOverwrite: {
        // Configuraciones de UI opcionales
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
    }

    // Pass the full URL as first parameter - this should work for localhost
    // Jitsi will parse it and use the protocol from the URL
    console.log('🚀 Inicializando Jitsi Meet con:', {
      url: fullRoomUrl,
      hasJWT: !!jwtToken,
      options: {
        ...options,
        jwt: jwtToken ? `${jwtToken.substring(0, 20)}...` : undefined
      }
    })
    
    let instance: JitsiExternalAPI | null = null
    
    try {
      instance = new window.JitsiMeetExternalAPI(fullRoomUrl, options)
      setApi(instance)

      // Listen for authentication errors
      instance.on('videoConferenceJoined', () => {
        console.log('✅ Conectado exitosamente a la sala')
        setScriptError(null) // Clear any previous errors
      })

      instance.on('participantJoined', () => {
        console.log('👤 Participante se unió')
      })

      instance.on('authFailed', () => {
        console.error('❌ Error de autenticación JWT')
        setScriptError('Error de autenticación. Verifica que JITSI_APP_SECRET coincida con JWT_APP_SECRET del servidor.')
      })

      instance.on('readyToClose', () => {
        console.log('Sala cerrada')
      })

      instance.on('errorOccurred', (error: any) => {
        console.error('❌ Error en Jitsi:', error)
        setScriptError(`Error en Jitsi: ${error?.error || 'Error desconocido'}`)
      })

      instance.on('ready', () => {
        console.log('✅ Jitsi Meet está listo')
      })
    } catch (error) {
      console.error('❌ Error al crear instancia de Jitsi:', error)
      setScriptError(`Error al inicializar Jitsi: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }

    return () => {
      if (instance) {
        instance.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJitsiReady, roomInfo, jwtToken, isLoadingToken])

  const handleReload = () => {
    if (!containerRef.current) return
    // Fuerza un "re-mount" sencillo limpiando el contenedor y volviendo a marcar ready
    containerRef.current.innerHTML = ''
    if (api) {
      api.dispose()
      setApi(null)
    }
    setIsJitsiReady(true)
  }

  return (
    <>
      <Script
        src={(() => {
          // Build script URL properly
          const protocol = getJitsiProtocol(JITSI_DEFAULT_DOMAIN)
          const domain = JITSI_DEFAULT_DOMAIN.includes('://') 
            ? new URL(JITSI_DEFAULT_DOMAIN).host 
            : JITSI_DEFAULT_DOMAIN
          const scriptUrl = `${protocol}://${domain}/external_api.js`
          console.log('📜 Loading Jitsi script from:', scriptUrl)
          return scriptUrl
        })()}
        strategy="afterInteractive"
        onReady={() => setIsJitsiReady(true)}
        onError={(e) => {
          const errorMsg = e instanceof Error ? e.message : String(e) || 'Error desconocido'
          const protocol = getJitsiProtocol(JITSI_DEFAULT_DOMAIN)
          const domain = JITSI_DEFAULT_DOMAIN.includes('://') 
            ? new URL(JITSI_DEFAULT_DOMAIN).host 
            : JITSI_DEFAULT_DOMAIN
          const scriptUrl = `${protocol}://${domain}/external_api.js`
          console.error('Error cargando Jitsi external_api.js:', {
            error: errorMsg,
            domain,
            protocol,
            url: scriptUrl,
          })
          setScriptError(`No se pudo cargar la librería de Jitsi desde ${domain}. Verifica que el servidor esté corriendo.`)
        }}
      />

      <Section className="max-w-6xl mx-auto">
        <div className="mb-8">
          <GradientText as="h1" className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Video className="w-8 h-8" />
            Sala de Videochat
          </GradientText>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Espacio seguro para sesiones entre usuarios y profesionales de la salud mental.
            Puedes compartir esta URL con tu terapeuta o paciente para entrar a la misma sala.
          </p>
        </div>

        <GlassCard className="p-4 md:p-6 h-[70vh] flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Sala actual:</span>{' '}
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {roomInfo ? `${roomInfo.domain}/${roomInfo.roomName}` : 'Resolviendo sala...'}
                </code>
              </div>
              <div className="mt-1 text-xs">
                Si tu sesión viene desde el flujo de emparejamiento, esta sala puede llegar
                como `externalUrl` desde `/api/sessions`.
              </div>
            </div>

            <div className="flex gap-2">
              <CTAButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (typeof window !== 'undefined' && roomInfo) {
                    // Use the same protocol logic as the main URL construction
                    const protocol = getJitsiProtocol(roomInfo.domain)
                    let domain = roomInfo.domain
                    if (domain.includes('://')) {
                      domain = new URL(domain).host
                    }
                    window.navigator.clipboard
                      ?.writeText(`${protocol}://${domain}/${roomInfo.roomName}`)
                      .catch(() => {})
                  }
                }}
              >
                Copiar link de sala
              </CTAButton>
              <CTAButton
                variant="ghost"
                size="sm"
                onClick={handleReload}
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Recargar
              </CTAButton>
            </div>
          </div>

          <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
            {(!isJitsiReady || isLoadingToken) && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                {scriptError || isLoadingToken ? 'Configurando sala segura...' : 'Cargando componente de video...'}
              </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
          </div>

          <p className="text-xs text-muted-foreground">
            Nota: en producción configura tu dominio de Jitsi en{' '}
            <code>NEXT_PUBLIC_JITSI_DOMAIN</code> y un prefijo de sala en{' '}
            <code>NEXT_PUBLIC_JITSI_ROOM_PREFIX</code> para generar rooms más
            predecibles y privados.
          </p>
        </GlassCard>
      </Section>
    </>
  )
}

export default function VideochatPage() {
  return (
    <Suspense fallback={null}>
      <VideochatInner />
    </Suspense>
  )
}



