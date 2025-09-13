'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { Bot, Send, MessageSquare, Brain, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// import { useUIStore } from '@/lib/store' // TODO: Use for personalized responses
import { marked } from 'marked'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Helper function to render markdown safely
const renderMarkdown = (content: string): string => {
  try {
    const result = marked(content)
    // Handle both sync and async results
    if (typeof result === 'string') {
      return result
    } else {
      // For async results, return the content as fallback
      console.warn('Async markdown rendering not supported in this context')
      return content
    }
  } catch (error) {
    console.error('Markdown rendering error:', error)
    return content
  }
}

export default function MotusAIPage() {
  // const { role } = useUIStore() // TODO: Use role for personalized responses
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy MotusAI, tu asistente especializado en salud mental. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      // Convert messages to the new API format
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }))
      
      const requestBody = {
        messages: apiMessages
      }
      
      console.log('Sending request to API:', requestBody)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = 'Error al procesar la solicitud'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respuesta del servidor no es válida')
      }

      const data = await response.json()
      
      // Handle different response formats based on mode
      let responseContent = ''
      if (data.mode === 'supervisor') {
        // Format supervisor response nicely with markdown headers
        responseContent = `## Apertura de significantes\n\n${data.apertura}\n\n## Reflexión sobre el discurso\n\n${data.reflexion}\n\n## Cierre analítico\n\n${data.cierre}\n\n## Recomendación final\n\n${data.recomendacion}\n\n## Disponibilidad\n\n${data.disponibilidad}`
      } else {
        // Regular Q&A response
        responseContent = data.text || data.message || 'No se pudo generar una respuesta.'
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error instanceof Error ? error.message : 'Error al conectar con MotusAI')
      
      // Fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta de nuevo en unos momentos.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  MotusAI
                </GradientText>
                <p className="text-muted-foreground">Tu asistente de salud mental</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <GlassCard className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">MotusAI</h3>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? 'Escribiendo...' : error ? 'Error de conexión' : 'En línea'}
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 mx-4 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isUser
                            ? 'bg-gradient-mauve text-white'
                            : 'glass-card text-foreground'
                        }`}
                      >
                        <div 
                          className="text-sm prose prose-sm max-w-none prose-headings:text-mauve-300 prose-strong:text-mauve-300 prose-strong:font-semibold"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(message.content)
                          }}
                        />
                        <p className="text-xs opacity-70 mt-1">
                          {isClient ? message.timestamp.toLocaleTimeString() : '--:--:--'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="glass-card p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-mauve-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-mauve-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-mauve-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-4 py-2 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <CTAButton
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </CTAButton>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-mauve-500" />
                  Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <CTAButton
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setInputValue('¿Cómo puedo manejar la ansiedad?')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Manejar Ansiedad
                  </CTAButton>
                  <CTAButton
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setInputValue('Necesito técnicas de relajación')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Técnicas de Relajación
                  </CTAButton>
                  <CTAButton
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setInputValue('Entra en modo supervisor: paciente con ansiedad y evitación social')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Modo Supervisor
                  </CTAButton>
                </div>
              </GlassCard>

              {/* Chat History */}
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4">Historial de Chats</h3>
                <div className="space-y-2">
                  <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <p className="text-sm font-medium">Conversación de hoy</p>
                    <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                  </div>
                  <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <p className="text-sm font-medium">Técnicas de respiración</p>
                    <p className="text-xs text-muted-foreground">Ayer</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

