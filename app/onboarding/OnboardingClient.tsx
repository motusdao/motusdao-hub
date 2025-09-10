'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { RolePickerModal } from '@/components/onboarding/RolePickerModal'
import { useOnboardingStore } from '@/lib/onboarding-store'

export default function OnboardingClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role, reset } = useOnboardingStore()
  const [showRolePicker, setShowRolePicker] = useState(false)

  const roleParam = searchParams.get('role') as 'usuario' | 'psm' | null

  useEffect(() => {
    // If no role in URL, show role picker
    if (!roleParam || !['usuario', 'psm'].includes(roleParam)) {
      setShowRolePicker(true)
    } else if (roleParam !== role) {
      // If role in URL is different from store, reset and set new role
      reset()
    }
  }, [roleParam, role, reset])

  const handleRolePickerClose = () => {
    setShowRolePicker(false)
    // If no role selected, redirect to home
    if (!roleParam) {
      router.push('/')
    }
  }

  // Show role picker if no valid role
  if (showRolePicker || !roleParam || !['usuario', 'psm'].includes(roleParam)) {
    return (
      <RolePickerModal 
        isOpen={showRolePicker} 
        onClose={handleRolePickerClose} 
      />
    )
  }

  // Show wizard for valid role
  return <OnboardingWizard role={roleParam} />
}
