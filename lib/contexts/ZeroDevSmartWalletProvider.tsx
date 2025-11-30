'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { 
  createKernelAccount, 
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  type KernelAccountClient
} from '@zerodev/sdk'
import { getEntryPoint, KERNEL_V3_1 } from '@zerodev/sdk/constants'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { createPublicClient, createWalletClient, custom, http, type Address, type WalletClient, type Account, type Transport, type Chain } from 'viem'
import { celoMainnet } from '@/lib/celo'

// FORZAR Celo Mainnet - no importa qué diga el dashboard
const FORCED_CHAIN = celoMainnet // Chain ID 42220

interface ZeroDevContextType {
  kernelClient: KernelAccountClient | null
  smartAccountAddress: Address | null
  isInitializing: boolean
  error: string | null
}

const ZeroDevContext = createContext<ZeroDevContextType>({
  kernelClient: null,
  smartAccountAddress: null,
  isInitializing: false,
  error: null,
})

export function useSmartAccount() {
  return useContext(ZeroDevContext)
}

interface ZeroDevSmartWalletProviderProps {
  children: ReactNode
  zeroDevProjectId: string
}

export function ZeroDevSmartWalletProvider({ 
  children, 
  zeroDevProjectId 
}: ZeroDevSmartWalletProviderProps) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [kernelClient, setKernelClient] = useState<KernelAccountClient | null>(null)
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSmartWallet = async () => {
      if (!authenticated || !wallets || wallets.length === 0) {
        setKernelClient(null)
        setSmartAccountAddress(null)
        setIsInitializing(false)
        return
      }

      try {
        setIsInitializing(true)
        setError(null)
        console.log('[ZERODEV] Initializing smart wallet with wallets:', wallets.length)
        console.log('[ZERODEV] Using Celo Mainnet (Chain ID: 42220)')
        
        // Get EntryPoint v0.7 from ZeroDev SDK
        const entryPoint = getEntryPoint('0.7')
        
        // Look for either embedded wallet (email login) or connected wallet (MetaMask login)
        const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy')
        const connectedWallet = wallets.find((wallet) => wallet.walletClientType !== 'privy')
        
        const walletToUse = embeddedWallet || connectedWallet
        if (!walletToUse) {
          console.log('[ZERODEV] No wallet found for smart account creation')
          setIsInitializing(false)
          return
        }
        
        console.log('[ZERODEV] Found wallet:', {
          address: walletToUse.address,
          type: walletToUse.walletClientType,
          isEmbedded: !!embeddedWallet,
          isConnected: !!connectedWallet,
          chainId: walletToUse.chainId
        })
        
        // Log all available wallets for debugging
        console.log('[ZERODEV] All available wallets:', wallets.map(w => ({
          address: w.address,
          type: w.walletClientType,
          chainId: w.chainId
        })))
        
        // Get the EIP1193 provider from the selected wallet
        const provider = await walletToUse.getEthereumProvider()
        if (!provider) {
          throw new Error('Failed to get Ethereum provider from wallet')
        }

        console.log('[ZERODEV] Creating ECDSA Kernel smart account...')
        
        // Create public client for blockchain interactions
        const publicClient = createPublicClient({
          chain: FORCED_CHAIN,
          transport: http(),
        })
        
        console.log('[ZERODEV] Creating ECDSA validator...')
        
        // Create wallet client with account for signing
        // Using address with custom transport - the provider handles signing
        // Type assertion needed because viem's type system doesn't fully recognize
        // that custom transport with address string works as a WalletClient with Account
        const walletClient = createWalletClient({
          account: walletToUse.address as `0x${string}`,
          chain: FORCED_CHAIN,
          transport: custom(provider),
        }) as WalletClient<Transport, Chain, Account>
        
        // Create ECDSA validator using ZeroDev SDK
        // WalletClient with Account is a valid Signer type
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer: walletClient,
          entryPoint: entryPoint,
          kernelVersion: KERNEL_V3_1,
        })
        
        console.log('[ZERODEV] Creating Kernel account...')
        
        // Create Kernel account using ZeroDev SDK with proper version for EntryPoint v0.7
        // Using index: 0 to ensure deterministic address for the same owner
        // This ensures the same EOA always gets the same smart wallet address
        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: ecdsaValidator,
          },
          entryPoint: entryPoint,
          kernelVersion: KERNEL_V3_1,
          index: BigInt(0), // Use index 0 for deterministic address - same owner = same address
        })
        
        console.log('[ZERODEV] Smart account created with index 0 (deterministic)')
        console.log('[ZERODEV] Owner (EOA):', walletToUse.address)
        console.log('[ZERODEV] Smart account address:', account.address)

        console.log('[ZERODEV] Created smart account:', account.address)

        // URLs with Chain ID 42220 (Celo Mainnet)
        const bundlerUrl = `https://rpc.zerodev.app/api/v3/${zeroDevProjectId}/chain/${FORCED_CHAIN.id}`
        
        // ZeroDev Paymaster Configuration (Self-Funded)
        // Using selfFunded=true since you've deposited CELO directly to the paymaster contract
        const paymasterUrl = `https://rpc.zerodev.app/api/v2/paymaster/${zeroDevProjectId}?selfFunded=true`
        
        console.log('[ZERODEV] Creating ZeroDev paymaster client...')
        console.log('[ZERODEV] Paymaster URL:', paymasterUrl.replace(zeroDevProjectId, '***'))
        
        // Create ZeroDev paymaster client
        const paymasterClient = createZeroDevPaymasterClient({
          chain: FORCED_CHAIN,
          transport: http(paymasterUrl),
        })
        
        console.log('[ZERODEV] ✅ ZeroDev paymaster client created (self-funded)')
        
        console.log('[ZERODEV] Creating Kernel account client...')
        
        // Create Kernel client using ZeroDev SDK with ZeroDev paymaster
        const client = createKernelAccountClient({
          account,
          chain: FORCED_CHAIN,
          bundlerTransport: http(bundlerUrl),
          paymaster: paymasterClient, // ZeroDev paymaster client (self-funded)
          client: publicClient,
        })
        
        console.log('[ZERODEV] ✅ ZeroDev paymaster configured - gasless transactions enabled')
        
        console.log("[ZERODEV] ✅ Smart account client created:", client.account.address)
        console.log("[ZERODEV] Chain ID:", await client.getChainId())

        setKernelClient(client)
        setSmartAccountAddress(account.address)
      } catch (err) {
        console.error("[ZERODEV] ❌ Error initializing smart wallet:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsInitializing(false)
      }
    }

    initializeSmartWallet()
  }, [authenticated, wallets, zeroDevProjectId])

  return (
    <ZeroDevContext.Provider
      value={{
        kernelClient,
        smartAccountAddress,
        isInitializing,
        error,
      }}
    >
      {children}
    </ZeroDevContext.Provider>
  )
}

