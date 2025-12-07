import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get Privy user from request
 * For now, we'll get privyId from headers or query params
 * In production, this should use Privy's server-side authentication
 */
export async function getPrivyUser(request: NextRequest): Promise<{ id: string } | null> {
  // Try to get privyId from headers (set by client)
  const privyId = request.headers.get('x-privy-id') || 
                  request.headers.get('privy-id')
  
  if (privyId) {
    return { id: privyId }
  }

  // Try to get from query params (for development)
  const { searchParams } = new URL(request.url)
  const queryPrivyId = searchParams.get('privyId')
  
  if (queryPrivyId) {
    return { id: queryPrivyId }
  }

  return null
}
