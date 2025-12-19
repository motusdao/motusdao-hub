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

// Tipo mínimo para los argumentos de getPaymasterData que realmente usamos
type PimlicoPaymasterArgs = {
  userOperation: {
    sender: Address
    nonce: bigint | string
    initCode?: `0x${string}` | null
    callData: `0x${string}`
    callGasLimit: bigint | string
    verificationGasLimit: bigint | string
    preVerificationGas: bigint | string
    maxFeePerGas: bigint | string
    maxPriorityFeePerGas: bigint | string
    paymasterAndData?: `0x${string}`
    signature?: `0x${string}`
  }
}

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

  // Log component mount and props
  console.log('[ZERODEV] Provider mounted/updated:', {
    hasProjectId: !!zeroDevProjectId,
    projectId: zeroDevProjectId ? `${zeroDevProjectId.substring(0, 8)}...` : 'missing',
    authenticated,
    walletsCount: wallets?.length || 0,
  })

  useEffect(() => {
    console.log('[ZERODEV] ⚡ useEffect triggered')
    const initializeSmartWallet = async () => {
      console.log('[ZERODEV] Effect triggered:', { authenticated, walletsCount: wallets?.length, wallets })
      
      if (!authenticated) {
        console.log('[ZERODEV] Not authenticated, skipping initialization')
        setKernelClient(null)
        setSmartAccountAddress(null)
        setIsInitializing(false)
        return
      }
      
      if (!wallets || wallets.length === 0) {
        console.log('[ZERODEV] No wallets available yet, waiting...')
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
        // IMPORTANT: Even though project is created on Alfajores (testnet) in dashboard,
        // the same Project ID works on Celo Mainnet by specifying chain ID in URL
        const bundlerUrl = `https://rpc.zerodev.app/api/v3/${zeroDevProjectId}/chain/${FORCED_CHAIN.id}`
        
        // Paymaster Configuration: Use Pimlico if available, otherwise use ZeroDev
        // Check if Pimlico is configured (we'll use server-side proxy, so we check if endpoint exists)
        const usePimlico = true // We'll try Pimlico first, fallback to ZeroDev on error
        
        let paymasterClient
        
        if (usePimlico) {
          // Use Pimlico Paymaster via server-side proxy (API key stays secure on server)
          console.log('[ZERODEV] 🔄 Using Pimlico paymaster (via secure proxy)')
          console.log('[ZERODEV] ℹ️ Smart wallets still created by ZeroDev, only paymaster is Pimlico')
          console.log('[ZERODEV] 🔒 API key is secure on server, not exposed to client')
          
          // Create custom Pimlico paymaster client that calls our server-side proxy
          // This keeps the API key secure on the server
          paymasterClient = {
            async getPaymasterData(args: PimlicoPaymasterArgs) {
              try {
                // Helper function to convert BigInt to hex string
                const toHex = (value: bigint | string): string => {
                  if (typeof value === 'string') {
                    // If already hex string, ensure it has 0x prefix
                    return value.startsWith('0x') ? value : `0x${value}`
                  }
                  // Convert BigInt to hex
                  const hex = value.toString(16)
                  return `0x${hex}`
                }

                // Serialize userOperation for Pimlico API
                // Pimlico expects hex strings for all numeric values
                const userOperation = {
                  sender: args.userOperation.sender,
                  nonce: toHex(args.userOperation.nonce),
                  initCode: args.userOperation.initCode || '0x',
                  callData: args.userOperation.callData,
                  callGasLimit: toHex(args.userOperation.callGasLimit),
                  verificationGasLimit: toHex(args.userOperation.verificationGasLimit),
                  preVerificationGas: toHex(args.userOperation.preVerificationGas),
                  maxFeePerGas: toHex(args.userOperation.maxFeePerGas),
                  maxPriorityFeePerGas: toHex(args.userOperation.maxPriorityFeePerGas),
                  paymasterAndData: '0x',
                  signature: '0x',
                }

                console.log('[ZERODEV] 📤 Calling Pimlico paymaster via secure proxy...')

                // Call our server-side proxy endpoint (API key stays on server)
                const response = await fetch('/api/pimlico/paymaster', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    chainId: FORCED_CHAIN.id,
                    userOperation,
                  }),
                })

                if (!response.ok) {
                  let errorData: { error?: string } = {}
                  try {
                    errorData = await response.json()
                  } catch {
                    const errorText = await response.text()
                    errorData = { error: errorText }
                  }
                  console.error('[ZERODEV] ❌ Pimlico proxy error:', response.status, errorData)
                  throw new Error(`Pimlico proxy error: ${response.status} ${errorData.error || 'Unknown error'}`)
                }

                const result = await response.json()
                console.log('[ZERODEV] ✅ Pimlico paymaster response received')
                
                // Convert Pimlico response to ZeroDev format
                // Pimlico returns hex strings, we need to convert to BigInt for ZeroDev
                const paymasterAndData = result.paymasterAndData || '0x'
                const verificationGasLimit = typeof result.verificationGasLimit === 'string'
                  ? BigInt(result.verificationGasLimit)
                  : BigInt(result.verificationGasLimit || 0)
                const preVerificationGas = typeof result.preVerificationGas === 'string'
                  ? BigInt(result.preVerificationGas)
                  : BigInt(result.preVerificationGas || 0)
                const callGasLimit = typeof result.callGasLimit === 'string'
                  ? BigInt(result.callGasLimit)
                  : BigInt(result.callGasLimit || 0)
                
                // Return in ZeroDev's expected format
                return {
                  paymasterAndData: paymasterAndData as `0x${string}`,
                  verificationGasLimit,
                  preVerificationGas,
                  callGasLimit,
                }
              } catch (error) {
                console.error('[ZERODEV] ❌ Pimlico paymaster error:', error)
                // If Pimlico fails, we could fallback to ZeroDev here
                // For now, we'll let it throw so user knows there's an issue
                throw error
              }
            },
            async getPaymasterStubData(args: PimlicoPaymasterArgs) {
              // Return stub data for gas estimation
              // This is used during gas estimation before the actual userOp is created
              return {
                paymasterAndData: '0x' as `0x${string}`,
              }
            },
          }
          
          console.log('[ZERODEV] ✅ Pimlico paymaster client created', {
            chainId: FORCED_CHAIN.id,
            note: 'Using Pimlico paymaster via secure server-side proxy'
          })
        } else {
          // Use ZeroDev Paymaster (fallback)
          const useSelfFunded = process.env.NEXT_PUBLIC_ZERODEV_SELF_FUNDED === 'true'
          
          // IMPORTANT: Paymaster uses v2 API (not v3 like bundler)
          // v2 format: /api/v2/paymaster/{projectId}?selfFunded=true
          // v3 format doesn't have /paymaster endpoint (causes 404)
          const paymasterUrl = useSelfFunded
            ? `https://rpc.zerodev.app/api/v2/paymaster/${zeroDevProjectId}?selfFunded=true&chainId=${FORCED_CHAIN.id}`
            : `https://rpc.zerodev.app/api/v2/paymaster/${zeroDevProjectId}?chainId=${FORCED_CHAIN.id}`
          
          console.log('[ZERODEV] ⚙️ Configuration:', {
            projectId: zeroDevProjectId.substring(0, 8) + '...',
            chainId: FORCED_CHAIN.id,
            chainName: FORCED_CHAIN.name,
            mode: useSelfFunded ? 'self-funded' : 'credit-card-billing',
            selfFundedEnv: process.env.NEXT_PUBLIC_ZERODEV_SELF_FUNDED,
            useSelfFunded,
            paymasterUrl: paymasterUrl.replace(zeroDevProjectId, '***'),
            note: 'Dashboard may show Alfajores, but mainnet works via chainId in URL',
          })
          console.log('[ZERODEV] 📦 Bundler URL:', bundlerUrl.replace(zeroDevProjectId, '***'))
          console.log('[ZERODEV] 💰 Paymaster URL:', paymasterUrl.replace(zeroDevProjectId, '***'))
          
          if (useSelfFunded) {
            console.warn('[ZERODEV] ⚠️ Self-funded mode enabled.')
            console.warn('[ZERODEV] ⚠️ IMPORTANT: ZeroDev plan gratuito NO permite mainnet.')
            console.warn('[ZERODEV] ⚠️ Aunque tengas contratos fondeados, la API bloqueará mainnet.')
            console.warn('[ZERODEV] ⚠️ Considera usar Pimlico paymaster (NEXT_PUBLIC_PIMLICO_API_KEY)')
          } else {
            console.log('[ZERODEV] ✅ Using ZeroDev credit card billing mode')
            console.log('[ZERODEV] ℹ️ ZeroDev will front gas and charge your credit card')
            console.log('[ZERODEV] ℹ️ Gas credits ($10 USD) will be used automatically first')
            console.log('[ZERODEV] ℹ️ After credits are exhausted, charges will go to credit card')
          }
          
          // Create ZeroDev paymaster client
          paymasterClient = createZeroDevPaymasterClient({
            chain: FORCED_CHAIN,
            transport: http(paymasterUrl),
          })
          
          console.log('[ZERODEV] ✅ ZeroDev paymaster client created', {
            mode: useSelfFunded ? 'self-funded (mainnet)' : 'credit-card-billing',
            chainId: FORCED_CHAIN.id,
            note: useSelfFunded 
              ? 'Make sure paymaster contract is funded on Celo Mainnet (42220)' 
              : 'Using credit card billing'
          })
        }
        
        console.log('[ZERODEV] Creating Kernel account client...')
        
        // Create Kernel client using ZeroDev SDK
        // Smart wallets are created by ZeroDev, but paymaster can be Pimlico or ZeroDev
        const client = createKernelAccountClient({
          account,
          chain: FORCED_CHAIN,
          bundlerTransport: http(bundlerUrl), // ZeroDev bundler (always)
          paymaster: paymasterClient, // Pimlico or ZeroDev paymaster
          client: publicClient,
        })
        
        console.log('[ZERODEV] ✅ Paymaster configured - gasless transactions enabled', {
          paymaster: usePimlico ? 'Pimlico' : 'ZeroDev',
          smartWallets: 'ZeroDev Kernel',
          bundler: 'ZeroDev'
        })
        
        console.log("[ZERODEV] ✅ Smart account client created:", client.account.address)
        console.log("[ZERODEV] Chain ID:", await client.getChainId())

        setKernelClient(client)
        setSmartAccountAddress(account.address)
      } catch (err) {
        console.error("[ZERODEV] ❌ Error initializing smart wallet:", err)
        console.error("[ZERODEV] Error details:", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          name: err instanceof Error ? err.name : undefined,
        })
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsInitializing(false)
      }
    }

    // Always try to initialize - the function will handle missing dependencies
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

