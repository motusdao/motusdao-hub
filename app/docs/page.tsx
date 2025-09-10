'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { CTAButton } from '@/components/ui/CTAButton'
import { 
  FileText, 
  Book, 
  Palette, 
  Briefcase, 
  Download,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const docCategories = [
  {
    id: 'brandbook',
    title: 'Brandbook',
    description: 'Guía completa de la identidad visual y valores de MotusDAO',
    icon: Book,
    color: 'from-blue-500 to-purple-600',
    sections: [
      'Introducción',
      'Misión y Visión',
      'Valores Corporativos',
      'Personalidad de Marca',
      'Aplicaciones'
    ]
  },
  {
    id: 'brandkit',
    title: 'Brandkit',
    description: 'Recursos de diseño, logos, colores y tipografías',
    icon: Palette,
    color: 'from-pink-500 to-rose-600',
    sections: [
      'Logotipos',
      'Paleta de Colores',
      'Tipografías',
      'Iconografía',
      'Elementos Gráficos'
    ]
  },
  {
    id: 'whitepaper',
    title: 'Whitepaper',
    description: 'Documento técnico sobre la tecnología y protocolo',
    icon: FileText,
    color: 'from-green-500 to-emerald-600',
    sections: [
      'Resumen Ejecutivo',
      'Tecnología Blockchain',
      'Protocolo de Salud Mental',
      'Tokenomics',
      'Roadmap'
    ]
  },
  {
    id: 'business-model',
    title: 'Modelo de Negocio',
    description: 'Estrategia comercial y modelo de ingresos',
    icon: Briefcase,
    color: 'from-yellow-500 to-orange-600',
    sections: [
      'Propuesta de Valor',
      'Segmentos de Mercado',
      'Canales de Distribución',
      'Modelo de Ingresos',
      'Análisis Competitivo'
    ]
  }
]

export default function DocsPage() {
  const [activeCategory, setActiveCategory] = useState('brandbook')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = docCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeDoc = docCategories.find(doc => doc.id === activeCategory)

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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <GradientText as="h1" className="text-4xl md:text-5xl font-bold">
                  Documentación
                </GradientText>
                <p className="text-muted-foreground">Recursos y guías de MotusDAO</p>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar documentación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 glass-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-mauve-500 focus:border-transparent"
                />
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <GlassCard className="p-6 sticky top-24">
                  <h3 className="text-lg font-semibold mb-4">Categorías</h3>
                  <div className="space-y-2">
                    {filteredCategories.map((category) => {
                      const Icon = category.icon
                      return (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            activeCategory === category.id
                              ? 'bg-mauve-500/20 border border-mauve-500/30'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{category.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Document Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <GlassCard className="p-8">
                  {/* Document Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${activeDoc?.color} rounded-lg flex items-center justify-center`}>
                        {activeDoc && <activeDoc.icon className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{activeDoc?.title}</h2>
                        <p className="text-muted-foreground">{activeDoc?.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <CTAButton variant="secondary" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </CTAButton>
                      <CTAButton variant="secondary" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Online
                      </CTAButton>
                    </div>
                  </div>

                  {/* Table of Contents */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Índice</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activeDoc?.sections.map((section, index) => (
                        <a
                          key={index}
                          href={`#section-${index + 1}`}
                          className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                          <span className="text-sm">{section}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="prose prose-invert max-w-none">
                    <div id="section-1" className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Introducción</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        MotusDAO es una plataforma descentralizada que combina tecnología blockchain, 
                        inteligencia artificial y atención profesional para revolucionar el acceso 
                        a servicios de salud mental. Nuestra misión es democratizar el bienestar 
                        mental a través de soluciones innovadoras y accesibles.
                      </p>
                    </div>

                    <div id="section-2" className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Características Principales</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-mauve-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Asistente de IA especializado en salud mental</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-mauve-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Plataforma de psicoterapia virtual</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-mauve-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Academia de bienestar mental</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-mauve-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Sistema de pagos descentralizado</span>
                        </li>
                      </ul>
                    </div>

                    <div id="section-3" className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Tecnología</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        MotusDAO utiliza tecnología blockchain para garantizar la privacidad, 
                        seguridad y transparencia de todas las transacciones y datos de salud mental. 
                        Nuestra plataforma está construida sobre principios de descentralización 
                        y privacidad por diseño.
                      </p>
                    </div>

                    <div id="section-4" className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Impacto Social</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        A través de MotusDAO, buscamos reducir las barreras de acceso a servicios 
                        de salud mental, especialmente en comunidades desatendidas. Nuestra 
                        plataforma democratiza el acceso a atención profesional y herramientas 
                        de bienestar mental de alta calidad.
                      </p>
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
