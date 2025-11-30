'use client'

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default function OnboardingClient() {
  // Role selection is now part of the wizard flow (step 1)
  // No need for role picker modal or URL params
  return <OnboardingWizard />
}
