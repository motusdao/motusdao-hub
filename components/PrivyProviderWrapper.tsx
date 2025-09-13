'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

interface PrivyProviderWrapperProps {
  children: ReactNode
}

export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
  return (
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
          createOnLogin: 'users-without-wallets' 
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
      {children}
    </PrivyProvider>
  )
}
