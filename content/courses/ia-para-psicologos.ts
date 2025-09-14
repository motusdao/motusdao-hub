import { Course } from "./types";

export const IA_PARA_PSICOLOGOS: Course = {
  slug: "ia-para-psicologos",
  title: "IA para Psicólogos: Potencia tu práctica en psicología digital",
  subtitle: "Taller práctico de 45 minutos",
  durationMinutes: 45,
  summary:
    "La integración ética de la IA en psicología permite usarla como copiloto clínico, acceder a evidencia en segundos y crear materiales psicoeducativos con eficiencia.",
  learningOutcomes: [
    "Optimizar la práctica clínica con prompts útiles para psicoterapia.",
    "Crear contenido psicoeducativo en minutos.",
    "Verificar hipótesis clínicas de forma estructurada.",
    "Buscar evidencia científica actualizada para decisiones basadas en evidencia."
  ],
  agenda: [
    { title: "Introducción a la IA", minutes: 5, description: "Qué es y cómo ayuda en psicología." },
    { title: "Dominando prompts", minutes: 10, description: "Crear prompts efectivos para casos clínicos." },
    { title: "PPT en minutos", minutes: 7, description: "Generar presentaciones educativas con IA." },
    { title: "Verificación clínica", minutes: 10, description: "Usar IA para revisar intervenciones." },
    { title: "Investigación con Perplexity", minutes: 8, description: "Encontrar evidencia científica en tiempo real." },
    { title: "Cierre y compromiso", minutes: 5, description: "Plan para integrar IA en la práctica." }
  ],
  sections: [
    {
      heading: "¿Qué es la IA y cómo te ayuda?",
      bullets: [
        "ChatGPT: modelo de lenguaje capaz de generar textos, guías y resúmenes.",
        "Perplexity: buscador con IA que prioriza fuentes verificadas y evidencia.",
        "Límites: no sustituye juicio clínico ni la supervisión profesional."
      ]
    },
    {
      heading: "El arte de un buen prompt",
      body:
        "Un prompt traduce tu intención clínica a un lenguaje interpretable por IA. Combina rol, tarea, formato y estilo.",
      bullets: [
        "Rol de la IA (p. ej., psicólogo cognitivo-conductual).",
        "Tarea específica (crear guía, evaluar intervención).",
        "Formato de salida (lista, PDF, diálogo, PPT).",
        "Estilo de lenguaje (formal, humano, accesible)."
      ],
      code:
`"Eres psicólogo cognitivo-conductual. Crea una guía de 5 pasos para manejar la ansiedad en adolescentes, en lenguaje sencillo."`
    },
    {
      heading: "Ética y Diagnósticos con IA",
      bullets: [
        "La IA es simbólica: no distingue naturalmente entre significante y significado.",
        "El síntoma no es el signo: busca el significante que lo organiza.",
        "Sesgos: la IA puede reforzar perspectivas del usuario (sesgo de confirmación).",
        "Apoyo diagnóstico: sugiere hipótesis alternativas, no reemplaza el juicio clínico."
      ],
      note: "La IA es apoyo; el diagnóstico final y la responsabilidad ética son del profesional."
    },
    {
      heading: "IA como apoyo en supervisión clínica",
      body:
        "Puede funcionar como segunda opinión estructurada respetando confidencialidad y marcos de supervisión.",
      bullets: [
        "Análisis de síntomas.",
        "Nuevas y alternas hipótesis.",
        "Puntos clave a supervisar."
      ]
    },
    {
      heading: "Evidencia científica en un clic",
      body:
        "Perplexity facilita búsquedas con referencias citadas. Prompts con más contexto generan mejores resultados.",
      bullets: [
        "Búsquedas específicas (p. ej., Trastornos de Ansiedad).",
        "Guía de prompt: \"Resumen de intervenciones basadas en evidencia para TAG (últimos 5 años), TCC vs farmacoterapia, con referencias (JAMA Psychiatry, Psychological Medicine)\".",
        "Actividad: cada participante genera prompts y los lleva a Perplexity."
      ]
    },
    {
      heading: "La Evolución de la IA en Psicología: Una Cronología",
      body:
        "Proyección 2025+ sobre integración de IA en clínica: asistente accesible → integración predictiva → fusión neurociencia → IA holística → empatía cuántica. Considera riesgos éticos y derechos digitales mentales."
    },
    {
      heading: "Ingeniería de Prompts para Aplicaciones en Salud Mental",
      body:
        "Los chatbots y apps de salud mental pueden apoyar procesos clínicos y psicoeducativos. Su efectividad depende de la ingeniería de prompts: diseñar instrucciones claras para que modelos como ChatGPT o Grok generen respuestas útiles, seguras y éticas. Esta guía adapta los fundamentos al contexto psicológico con referencias prácticas y ejemplos divididos por categorías. La IA complementa, no reemplaza, la intervención humana.",
      bullets: [
        "Elementos de un prompt efectivo: Instrucción, Contexto, Datos de entrada, Indicador de salida",
        "Consejos generales: Empieza simple, sé específico, evita imprecisión, enfócate en qué hacer",
        "Técnicas: Zero-shot para tareas simples, Few-shot para clasificar, Chain-of-thought para razonamiento",
        "Salvaguardas éticas: No diagnostiques, sugiere consultar profesional, protocolo de crisis"
      ],
      note: "La ingeniería de prompts permite crear interacciones útiles y seguras. Ética primero: anonimiza datos, evita diagnósticos, incorpora protocolos de crisis y supervisión humana."
    }
  ],
  activities: [
    {
      heading: "Actividad: IA Verificadora de Casos MotusDAO",
      body:
        "Simula un caso en grupo, introdúcelo al prompt y debate qué adoptar/descartar de las sugerencias de la IA."
    },
    {
      heading: "Guía Práctica: Ejemplos de Prompts para Salud Mental",
      body:
        "Colección de prompts listos para usar en diferentes contextos clínicos y psicoeducativos.",
      bullets: [
        "Soporte emocional y conversación (Role Prompting, Few-shot)",
        "Seguimiento de ánimo y evaluación (Mood Tracking, Zero-shot/COT)",
        "Intervenciones TCC/DBT (Few-shot)",
        "Manejo de crisis y seguridad (Zero-shot)",
        "Contenido educativo (resumen/extracción, COT)",
        "Resumen de sesiones clínicas",
        "Clasificación de texto clínico (Few-shot)",
        "Conversación simulada (role-play para entrenamiento)",
        "Plan breve de intervención (4 sesiones)",
        "Razonamiento y casos complejos (COT)"
      ]
    }
  ],
  resources: [
    { label: "Verificación de casos clínicos", href: "https://www.motusdao.org/verificacion-de-casos" },
    { label: "Supervisión: conviértete en supervisor", href: "https://www.motusdao.org/verificacion-supervision-casos" },
    { label: "Foro de investigación (publica resultados)", href: "https://www.motusdao.org/group/nuevas-tecnologias-en-psicologia/discussion" },
    { label: "Ingeniería de Prompts en Salud Mental", href: "https://www.motusdao.org" }
  ],
  cta: [
    { label: "Verificar caso clínico", href: "https://www.motusdao.org/verificacion-de-casos" },
    { label: "Quiero ser supervisor/a", href: "https://www.motusdao.org/verificacion-supervision-casos" }
  ]
};
