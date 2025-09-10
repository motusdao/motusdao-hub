import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'usuario' | 'psm'

export interface OnboardingData {
  // Paso 1: Conexión
  email: string
  walletAddress: string
  privyId?: string
  
  // Paso 2: Perfil básico
  nombre: string
  apellido: string
  telefono: string
  fechaNacimiento: string
  ciudad: string
  pais: string
  
  // Paso 3: Perfil específico por rol
  // Para Usuario
  tipoAtencion?: string
  problematica?: string
  preferenciaAsignacion?: 'automatica' | 'explorar'
  
  // Para PSM
  cedulaProfesional?: string
  formacionAcademica?: string
  experienciaAnios?: number
  biografia?: string
  especialidades?: string[]
  participaSupervision?: boolean
  participaCursos?: boolean
  participaInvestigacion?: boolean
  participaComunidad?: boolean
}

interface OnboardingState {
  // Estado del wizard
  currentStep: number
  role: UserRole | null
  data: Partial<OnboardingData>
  isCompleted: boolean
  
  // Acciones
  setRole: (role: UserRole) => void
  setCurrentStep: (step: number) => void
  updateData: (data: Partial<OnboardingData>) => void
  reset: () => void
  markCompleted: () => void
  
  // Validaciones por paso
  isStepValid: (step: number) => boolean
  canProceed: () => boolean
}

const initialData: Partial<OnboardingData> = {
  email: '',
  walletAddress: '',
  nombre: '',
  apellido: '',
  telefono: '',
  fechaNacimiento: '',
  ciudad: '',
  pais: '',
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentStep: 0,
      role: null,
      data: initialData,
      isCompleted: false,
      
      // Acciones
      setRole: (role) => set({ role }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      updateData: (newData) => set((state) => ({
        data: { ...state.data, ...newData }
      })),
      
      reset: () => set({
        currentStep: 0,
        role: null,
        data: initialData,
        isCompleted: false
      }),
      
      markCompleted: () => set({ isCompleted: true }),
      
      // Validaciones
      isStepValid: (step) => {
        const { data, role } = get()
        
        // Debug log
        console.log('Store isStepValid Debug:', {
          step,
          data: {
            email: data.email,
            walletAddress: data.walletAddress,
            nombre: data.nombre,
            apellido: data.apellido
          },
          role
        })
        
        switch (step) {
          case 0: // Conexión
            return !!(data.walletAddress && data.email)
          
          case 1: // Perfil específico (terapéutico o profesional)
            if (role === 'usuario') {
              return !!(
                data.tipoAtencion && 
                data.problematica && 
                data.preferenciaAsignacion
              )
            } else if (role === 'psm') {
              return !!(
                data.cedulaProfesional && 
                data.formacionAcademica && 
                data.experienciaAnios !== undefined && 
                data.experienciaAnios >= 0 &&
                data.especialidades && 
                data.especialidades.length > 0
              )
            }
            return false
          
          case 2: // Revisión
            return true // Siempre válido si llegamos aquí
          
          case 3: // Blockchain
            return true // Siempre válido si llegamos aquí
          
          default:
            return false
        }
      },
      
      canProceed: () => {
        const { currentStep, isStepValid } = get()
        return isStepValid(currentStep)
      }
    }),
    {
      name: 'motusdao-onboarding-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        role: state.role,
        data: state.data,
        isCompleted: state.isCompleted
      })
    }
  )
)

// Utilidades para obtener pasos por rol
export const getStepsForRole = (role: UserRole) => {
  const baseSteps = [
    { id: 0, title: 'Conexión', description: 'Conecta tu wallet y email' },
    { id: 1, title: 'Perfil', description: 'Información personal' },
    { id: 2, title: 'Revisión', description: 'Revisa tu información' },
    { id: 3, title: 'Blockchain', description: 'Registro en blockchain' },
    { id: 4, title: 'Listo', description: '¡Registro completado!' }
  ]
  
  if (role === 'usuario') {
    return [
      baseSteps[0], // Conexión
      { id: 1, title: 'Terapéutico', description: 'Perfil terapéutico' },
      ...baseSteps.slice(2) // Revisión, Blockchain, Listo
    ]
  } else {
    return [
      baseSteps[0], // Conexión
      { id: 1, title: 'Profesional', description: 'Datos profesionales' },
      ...baseSteps.slice(2) // Revisión, Blockchain, Listo
    ]
  }
}
