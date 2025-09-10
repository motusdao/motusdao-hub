import { Suspense } from 'react'
import OnboardingClient from './OnboardingClient'

// Evita SSG para páginas que dependen de search params
export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mauve-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando onboarding...</p>
        </div>
      </div>
    }>
      <OnboardingClient />
    </Suspense>
  )
}
