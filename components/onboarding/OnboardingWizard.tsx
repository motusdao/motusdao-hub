'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboardingStore, getStepsForRole } from '@/lib/onboarding-store'
import { WizardStepper } from './WizardStepper'
import { StepConnect } from './steps/StepConnect'
import { StepPerfilUsuario } from './steps/StepPerfilUsuario'
import { StepPerfilPSM } from './steps/StepPerfilPSM'
import { StepRevision } from './steps/StepRevision'
import { StepBlockchain } from './steps/StepBlockchain'
import { StepExito } from './steps/StepExito'

interface OnboardingWizardProps {
  role: 'usuario' | 'psm'
}

export function OnboardingWizard({ role }: OnboardingWizardProps) {
  const { 
    currentStep, 
    setCurrentStep, 
    setRole, 
    isStepValid, 
    canProceed,
    reset 
  } = useOnboardingStore()

  const steps = getStepsForRole(role)

  useEffect(() => {
    setRole(role)
    // Reset to first step if needed
    if (currentStep >= steps.length) {
      setCurrentStep(0)
    }
  }, [role, currentStep, steps.length, setRole, setCurrentStep])

  const handleNext = () => {
    console.log('OnboardingWizard handleNext Debug:', {
      canProceed: canProceed(),
      currentStep,
      stepsLength: steps.length,
      isStepValid: isStepValid(currentStep)
    })
    
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps, current step, or valid upcoming steps
    const canNavigate = stepIndex <= currentStep || isStepValid(stepIndex)
    
    if (canNavigate) {
      setCurrentStep(stepIndex)
    } else {
      // Show a message or prevent navigation
      console.log(`Cannot navigate to step ${stepIndex} - not yet available`)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Don't reset automatically - let user stay on success page
    // reset()
    console.log('Onboarding completed successfully')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepConnect onNext={handleNext} onBack={handleBack} />
      
      case 1:
        if (role === 'usuario') {
          return <StepPerfilUsuario onNext={handleNext} onBack={handleBack} />
        } else {
          return <StepPerfilPSM onNext={handleNext} onBack={handleBack} />
        }
      
      case 2:
        return <StepRevision onNext={handleNext} onBack={handleBack} />
      
      case 3:
        return <StepBlockchain onNext={handleNext} onBack={handleBack} />
      
      case 4:
        return <StepExito onComplete={handleComplete} />
      
      default:
        return <StepConnect onNext={handleNext} onBack={handleBack} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Stepper */}
      <div className="sticky top-0 z-30 glass-card-strong border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <WizardStepper 
            steps={steps} 
            currentStep={currentStep} 
            role={role}
            onStepClick={handleStepClick}
            isStepValid={isStepValid}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator (Mobile) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4">
        <div className="glass-card-strong rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-white font-medium">
              {steps[currentStep]?.title}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%`
              }}
              transition={{ duration: 0.3 }}
              className="h-1 bg-gradient-to-r from-mauve-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
