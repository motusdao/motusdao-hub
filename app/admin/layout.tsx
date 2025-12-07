'use client'

// TEMPORAL: Autenticación deshabilitada para desarrollo
// TODO: Re-habilitar autenticación antes de producción

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // El sidebar se maneja desde el layout principal (SidebarWrapper)
  // Solo renderizamos el contenido aquí
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Banner de advertencia en desarrollo */}
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-sm text-yellow-400">
            ⚠️ <strong>Modo Desarrollo:</strong> Autenticación deshabilitada. Re-habilitar antes de producción.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}

