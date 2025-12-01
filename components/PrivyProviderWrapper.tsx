'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'
import { ZeroDevSmartWalletProvider } from '@/lib/contexts/ZeroDevSmartWalletProvider'
// Suppress Privy hydration warnings in development
import '@/lib/utils/suppress-privy-warnings'

interface PrivyProviderWrapperProps {
  children: ReactNode
}

export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
  // ZeroDev Project ID - can use Alfajores project ID with Celo Mainnet
  const zeroDevProjectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || 'e46f4ac3-404e-42fc-a3d3-1c75846538a8'

  return (
    <div suppressHydrationWarning>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          appearance: {
            theme: 'dark',
            accentColor: '#8B5CF6',
            logo: '/logo.svg',
            showWalletLoginFirst: false,
            walletList: ['metamask', 'wallet_connect', 'coinbase_wallet'],
          },
          embeddedWallets: { 
            createOnLogin: 'all-users', // Always create embedded wallet for all users
          },
          loginMethods: ['email', 'wallet'],
          mfa: {
            noPromptOnMfaRequired: false,
          },
          // Celo Mainnet Configuration
          defaultChain: {
            id: 42220, // Celo mainnet
            name: 'Celo',
            network: 'celo',
            nativeCurrency: {
              name: 'Celo',
              symbol: 'CELO',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://forno.celo.org'],
              },
              public: {
                http: ['https://forno.celo.org'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Celo Explorer',
                url: 'https://explorer.celo.org',
              },
            },
          },
          legal: {
            termsAndConditionsUrl: '/terms',
            privacyPolicyUrl: '/privacy',
          },
        }}
      >
        <ZeroDevSmartWalletProvider zeroDevProjectId={zeroDevProjectId}>
          {children}
        </ZeroDevSmartWalletProvider>
      </PrivyProvider>
    </div>
  )
}
