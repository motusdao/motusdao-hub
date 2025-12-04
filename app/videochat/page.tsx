'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Section } from '@/components/ui/Section'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { Video, RefreshCcw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type JitsiInitOptions = {
  roomName: string
  parentNode: HTMLElement
  width?: string | number
  height?: string | number
  configOverwrite?: Record<string, unknown>
  interfaceConfigOverwrite?: Record<string, unknown>
}

type JitsiExternalAPI = {
  dispose: () => void
  // We only use a tiny subset of the API in this page; the rest is left as unknown
  [key: string]: unknown
}

type JitsiExternalAPIConstructor = new (
  domain: string,
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

function buildFallbackRoom() {
  // Sala pseudo-aleatoria para pruebas manuales si no se pasa nada por query
  const slug = Math.random().toString(36).substring(2, 10)
  return `${JITSI_ROOM_PREFIX}${slug}`
}

export default function VideochatPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isJitsiReady, setIsJitsiReady] = useState(false)
  const [api, setApi] = useState<JitsiExternalAPI | null>(null)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [roomInfo, setRoomInfo] = useState<{ domain: string; roomName: string } | null>(null)
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

  useEffect(() => {
    if (!isJitsiReady) return
    if (!roomInfo) return
    if (!containerRef.current) return
    if (!window.JitsiMeetExternalAPI) return

    // Limpia instancias previas si se re-renderiza
    if (api) {
      api.dispose()
    }

    const options = {
      roomName: roomInfo.roomName,
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      configOverwrite: {
        // Aquí podemos luego ajustar duración, grabación, etc.
      },
      interfaceConfigOverwrite: {
        // Configuraciones de UI opcionales
      },
    }

    const instance = new window.JitsiMeetExternalAPI(roomInfo.domain, options)
    setApi(instance)

    return () => {
      instance?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJitsiReady, roomInfo])

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
        src={`https://${JITSI_DEFAULT_DOMAIN}/external_api.js`}
        strategy="afterInteractive"
        onReady={() => setIsJitsiReady(true)}
        onError={(e) => {
          console.error('Error cargando Jitsi external_api.js', e)
          setScriptError('No se pudo cargar la librería de Jitsi. Revisa el dominio configurado.')
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
                    window.navigator.clipboard
                      ?.writeText(`https://${roomInfo.domain}/${roomInfo.roomName}`)
                      .catch(() => {})
                  }
                }}
              >
                Copiar link de sala
              </CTAButton>
              <CTAButton
                variant="outline"
                size="sm"
                onClick={handleReload}
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Recargar
              </CTAButton>
            </div>
          </div>

          <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
            {!isJitsiReady && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                {scriptError || 'Cargando componente de video...'}
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



