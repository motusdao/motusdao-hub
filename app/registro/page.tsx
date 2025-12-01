'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { useOnboardingStore } from '@/lib/onboarding-store'

export default function RegistroPage() {
  const router = useRouter()
  const { authenticated, ready } = usePrivy()
  const { isCompleted, currentStep } = useOnboardingStore()

  // Redirect to home if registration is already completed
  useEffect(() => {
    if (ready && authenticated && isCompleted) {
      // Small delay to allow the success page to be seen
      const timer = setTimeout(() => {
        router.push('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [ready, authenticated, isCompleted, router])

  // Handle completion - StepExito will mark as completed and redirect
  const handleComplete = () => {
    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard />
    </div>
  )
}

