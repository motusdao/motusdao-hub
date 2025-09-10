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
          logo: 'https://your-logo-url.com/logo.png',
          showWalletLoginFirst: false,
          walletList: ['metamask', 'wallet_connect'],
        },
        embeddedWallets: { 
          ethereum: { 
            createOnLogin: 'users-without-wallets' 
          } 
        },
        loginMethods: ['email'],
        mfa: {
          noPromptOnMfaRequired: false,
        },
        // Prevent hydration issues
        // Additional configuration for better compatibility
        defaultChain: {
          id: 1, // Ethereum mainnet
          name: 'Ethereum',
          network: 'homestead',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://eth.llamarpc.com'],
            },
            public: {
              http: ['https://eth.llamarpc.com'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Etherscan',
              url: 'https://etherscan.io',
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
