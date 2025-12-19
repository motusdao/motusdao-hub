'use client'

import { useUIStore } from '@/lib/store'
import { Sidebar } from './Sidebar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export function SidebarWrapper() {
  const { role } = useUIStore()
  
  // Si el rol es admin, mostrar AdminSidebar
  if (role === 'admin') {
    return <AdminSidebar />
  }
  
  // Para otros roles, mostrar Sidebar normal
  return <Sidebar />
}


