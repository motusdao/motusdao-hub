# MotusDAO Hub

Una plataforma integral de salud mental que combina tecnología blockchain, inteligencia artificial y atención profesional para el bienestar mental.

## 🚀 Características

- **MotusAI**: Asistente de IA especializado en salud mental
- **Psicoterapia**: Conecta con profesionales de la salud mental
- **Academia**: Cursos y recursos para el bienestar mental
- **Bitácora**: Diario personal para reflexionar sobre emociones
- **Sistema de Pagos**: Pagos descentralizados (en desarrollo)
- **Documentación**: Recursos completos de la plataforma

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15+ con App Router, TypeScript
- **Styling**: Tailwind CSS con glassmorphism e iridiscencias
- **UI Components**: shadcn/ui, Lucide React
- **Animaciones**: Framer Motion, Three.js
- **Estado**: Zustand
- **Base de Datos**: Prisma ORM con SQLite (dev) / PostgreSQL (prod)
- **Autenticación**: Privy (smart accounts)
- **Blockchain**: Viem para interacciones con wallets

## 🎨 Diseño

- **Tipografías**: Jura (headings) y Inter (texto)
- **Colores**: Esquema morado/iris con gradientes iridiscentes
- **Estilo**: Glassmorphism, minimalista, futurista
- **Tema**: Dark/Light mode con persistencia
- **Responsive**: Diseño adaptativo para todos los dispositivos

## 🏗️ Estructura del Proyecto

```
motusdao-hub/
├── app/                    # App Router de Next.js
│   ├── (app)/             # Rutas principales
│   │   ├── page.tsx       # Home
│   │   ├── motusai/       # MotusAI
│   │   ├── psicoterapia/  # Psicoterapia
│   │   ├── academia/      # Academia
│   │   ├── bitacora/      # Bitácora
│   │   ├── perfil/        # Perfil
│   │   └── docs/          # Documentación
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base
│   ├── layout/           # Layout components
│   ├── forms/            # Formularios
│   └── three/            # Componentes 3D
├── lib/                  # Utilidades y configuración
├── prisma/               # Schema y seeds
└── styles/               # Estilos globales
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd motusdao-hub
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus valores:
   ```env
   DATABASE_URL="file:./dev.db"
   PRIVY_APP_ID="your_privy_app_id"
   PRIVY_APP_SECRET="your_privy_app_secret"
   ```

4. **Configurar base de datos**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Funcionalidades por Rol

### Usuario
- Inicio con hero animado y aplicaciones destacadas
- MotusAI para asistencia en salud mental
- Psicoterapia para conectar con profesionales
- Academia con cursos de bienestar mental
- Bitácora personal para reflexiones
- Perfil personalizable

### PSM (Profesional de Salud Mental)
- Todas las funcionalidades de Usuario
- Mis usuarios: gestión de pacientes
- Supervisión: revisión de casos de terapia
- Herramientas profesionales especializadas

## 🎯 Características Técnicas

### Autenticación
- Integración con Privy para smart accounts
- Conexión de wallets
- Gestión de sesiones

### Base de Datos
- Modelos para usuarios, perfiles, cursos, lecciones
- Sistema de bitácora con entradas de diario
- Mensajes de contacto
- Enrollments en cursos

### UI/UX
- Diseño glassmorphism con efectos de blur
- Gradientes iridiscentes
- Animaciones suaves con Framer Motion
- Componente 3D con Three.js (ADNBackdrop)
- Tema oscuro/claro persistente

### API
- Rutas RESTful para todas las funcionalidades
- Validación de datos
- Manejo de errores
- Paginación

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar schema con DB
npm run db:seed      # Poblar DB con datos de ejemplo
```

## 🚧 Estado del Proyecto

### ✅ Completado
- [x] Estructura base de Next.js 15+ con TypeScript
- [x] Configuración de Tailwind con glassmorphism
- [x] Componentes UI reutilizables
- [x] Sistema de roles (Usuario/PSM)
- [x] Navegación dinámica por rol
- [x] Todas las páginas principales
- [x] Integración con Prisma y SQLite
- [x] API routes para formularios
- [x] Sistema de bitácora funcional
- [x] Componente 3D con Three.js
- [x] Documentación integrada
- [x] Footer con formulario de contacto
- [x] Datos de ejemplo (seeds)

### 🚧 En Desarrollo
- [ ] Integración completa con Privy
- [ ] Sistema de pagos con Transak/MiniPay
- [ ] Integración con LLM para MotusAI
- [ ] Sistema de notificaciones
- [ ] Chat en tiempo real

### 📋 Próximas Funcionalidades
- [ ] Sistema de citas para psicoterapia
- [ ] Integración con calendarios
- [ ] Sistema de pagos descentralizado
- [ ] Marketplace de servicios
- [ ] Análisis de progreso con IA
- [ ] Aplicación móvil

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Contacto

- **Email**: contacto@motusdao.com
- **Website**: [MotusDAO Hub](https://motusdao.com)
- **Documentación**: `/docs` en la aplicación

---

**MotusDAO Hub** - Revolucionando la salud mental con tecnología blockchain 🧠✨