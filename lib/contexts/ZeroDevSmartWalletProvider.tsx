'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { 
  createKernelAccount, 
  createKernelAccountClient,
  type KernelAccountClient
} from '@zerodev/sdk'
import { getEntryPoint, KERNEL_V3_1 } from '@zerodev/sdk/constants'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { createPublicClient, createWalletClient, custom, http, type Address, type WalletClient, type Account, type Transport, type Chain } from 'viem'
import type { GetPaymasterDataParameters, GetPaymasterDataReturnType, GetPaymasterStubDataReturnType } from 'viem/account-abstraction'
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

        // Bundler Configuration: Smart routing based on method type
        // ZeroDev SDK uses some ZeroDev-specific methods (zd_*) that Pimlico doesn't support
        // Solution: Route ZeroDev-specific methods to ZeroDev bundler, standard ERC-4337 methods to Pimlico
        // This allows us to use Pimlico paymaster while maintaining compatibility with ZeroDev SDK
        
        // ZeroDev bundler URL
        const zeroDevBundlerUrl = `https://rpc.zerodev.app/api/v3/${zeroDevProjectId}/chain/${FORCED_CHAIN.id}`
        
        // Create smart bundler transport that routes methods intelligently
        const bundlerTransport = http('/api/pimlico/bundler', {
          fetchFn: async (url, options) => {
            // Parse the JSON-RPC request body to determine routing
            let requestBody: { method?: string; params?: unknown[]; jsonrpc?: string; id?: number | string | null } = {}
            let shouldUseZeroDevBundler = false
            let requestBodyToSend = options?.body
            
            if (options?.body) {
              try {
                requestBody = JSON.parse(options.body as string)
                const method = requestBody.method || ''
                
                // CRITICAL: Pimlico bundler does NOT support eth_estimateUserOperationGas on Celo Mainnet
                // We must use ZeroDev bundler for gas estimation, but strip paymasterAndData first
                // ZeroDev bundler rejects paymasterAndData during gas estimation
                if (method.startsWith('zd_') || 
                    method.includes('zerodev') ||
                    method === 'eth_estimateUserOperationGas') {
                  shouldUseZeroDevBundler = true
                  
                  // CRITICAL FIX: ZeroDev bundler rejects paymasterAndData during gas estimation
                  // Strip paymasterAndData from userOp before sending to ZeroDev bundler
                  if (method === 'eth_estimateUserOperationGas' && 
                      requestBody.params && 
                      Array.isArray(requestBody.params) && 
                      requestBody.params.length > 0) {
                    const userOp = requestBody.params[0] as Record<string, unknown>
                    if (userOp && typeof userOp === 'object' && 'paymasterAndData' in userOp) {
                      console.log('[ZERODEV] 🔧 Removing paymasterAndData from gas estimation request (ZeroDev bundler requirement)')
                      const { paymasterAndData, ...userOpWithoutPaymaster } = userOp
                      const modifiedRequestBody = {
                        ...requestBody,
                        params: [userOpWithoutPaymaster, ...requestBody.params.slice(1)]
                      }
                      requestBodyToSend = JSON.stringify(modifiedRequestBody)
                    }
                  }
                  
                  console.log('[ZERODEV] 🔀 Routing to ZeroDev bundler:', method)
                } else {
                  // Route other standard ERC-4337 methods to Pimlico bundler
                  console.log('[ZERODEV] 📤 Routing to Pimlico bundler:', method)
                }
              } catch {
                // If parsing fails, default to ZeroDev for safety
                console.log('[ZERODEV] ⚠️ Could not parse request, defaulting to ZeroDev bundler')
                shouldUseZeroDevBundler = true
              }
            }
            
            // Route to appropriate bundler
            const targetUrl = shouldUseZeroDevBundler 
              ? zeroDevBundlerUrl 
              : '/api/pimlico/bundler'
            
            const response = await fetch(targetUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: requestBodyToSend,
            })

            if (!response.ok) {
              let errorData: { error?: { message?: string } | string } = {}
              try {
                errorData = await response.json()
              } catch {
                // If JSON parsing fails, try to get text
                const errorText = await response.text()
                errorData = { error: errorText }
              }
              console.error('[ZERODEV] ❌ Bundler error:', response.status, errorData)
              
              // Check for API key configuration error
              let errorMessage: string = 'Unknown error'
              if (errorData.error) {
                if (typeof errorData.error === 'string') {
                  errorMessage = errorData.error
                } else if (errorData.error.message) {
                  errorMessage = errorData.error.message
                }
              }
              
              if (errorMessage.includes('Pimlico API key not configured') || 
                  errorMessage.includes('PIMLICO_API_KEY not configured')) {
                throw new Error(
                  'PIMLICO_API_KEY not configured in Vercel environment variables. ' +
                  'Pimlico bundler is REQUIRED for production. ' +
                  'Please add PIMLICO_API_KEY to your Vercel project settings.'
                )
              }
              
              throw new Error(`Bundler error: ${response.status} ${errorMessage}`)
            }

            return response
          },
        })
        
        console.log('[ZERODEV] 📦 Using smart bundler routing:')
        console.log('[ZERODEV]   - ZeroDev-specific methods (zd_*) → ZeroDev bundler')
        console.log('[ZERODEV]   - Gas estimation (eth_estimateUserOperationGas) → ZeroDev bundler (paymasterAndData stripped)')
        console.log('[ZERODEV]   - Other standard ERC-4337 methods → Pimlico bundler')
        console.log('[ZERODEV]   - Paymaster: Pimlico (REQUIRED for mainnet)')
        console.log('[ZERODEV] 🔒 Bundler API keys are secure on server, not exposed to client')
        
        // Paymaster Configuration: Pimlico is REQUIRED (ZeroDev paymaster doesn't work on mainnet with free plan)
        console.log('[ZERODEV] 🔧 Setting up paymaster...')
        console.log('[ZERODEV] 🔄 Using Pimlico paymaster (REQUIRED - ZeroDev does not work on mainnet)')
        console.log('[ZERODEV] ℹ️ Smart wallets still created by ZeroDev, only paymaster is Pimlico')
        console.log('[ZERODEV] 🔒 API key is secure on server, not exposed to client')
        console.log('[ZERODEV] ⚠️ If PIMLICO_API_KEY is not set in Vercel, transactions will fail')
        
        // Create custom Pimlico paymaster client that calls our server-side proxy
        // This keeps the API key secure on the server
        // ZeroDev paymaster is NOT an option - it doesn't work on mainnet with free plan
        const paymasterClient = {
            async getPaymasterData(args: GetPaymasterDataParameters): Promise<GetPaymasterDataReturnType> {
              try {
                console.log('[ZERODEV] 💰 getPaymasterData called with args:', {
                  sender: args.sender,
                  hasCallData: !!args.callData,
                  callGasLimit: args.callGasLimit?.toString(),
                  verificationGasLimit: args.verificationGasLimit?.toString(),
                  preVerificationGas: args.preVerificationGas?.toString(),
                })
                
                // Helper function to convert BigInt to hex string
                const toHex = (value: bigint | string | undefined): string => {
                  if (!value) return '0x0'
                  if (typeof value === 'string') {
                    // If already hex string, ensure it has 0x prefix
                    return value.startsWith('0x') ? value : `0x${value}`
                  }
                  // Convert BigInt to hex
                  const hex = value.toString(16)
                  return `0x${hex}`
                }

                // Serialize userOperation for Pimlico API
                // GetPaymasterDataParameters has fields directly, not nested in userOperation
                // Pimlico expects hex strings for all numeric values
                const userOperation = {
                  sender: args.sender,
                  nonce: toHex(args.nonce),
                  initCode: args.initCode || '0x',
                  callData: args.callData,
                  callGasLimit: toHex(args.callGasLimit),
                  verificationGasLimit: toHex(args.verificationGasLimit),
                  preVerificationGas: toHex(args.preVerificationGas),
                  maxFeePerGas: toHex(args.maxFeePerGas),
                  maxPriorityFeePerGas: toHex(args.maxPriorityFeePerGas),
                  paymasterAndData: '0x',
                  signature: '0x',
                }

                console.log('[ZERODEV] 📤 Calling Pimlico paymaster via secure proxy...')
                console.log('[ZERODEV] 📋 UserOperation for paymaster:', {
                  sender: userOperation.sender,
                  callDataLength: userOperation.callData.length,
                  callGasLimit: userOperation.callGasLimit,
                  verificationGasLimit: userOperation.verificationGasLimit,
                  preVerificationGas: userOperation.preVerificationGas,
                })

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
                  
                  // If Pimlico API key not configured, provide clear error (don't fallback to ZeroDev)
                  if (response.status === 500 && errorData.error?.includes('Pimlico API key not configured')) {
                    const errorMsg = 'PIMLICO_API_KEY not configured in Vercel environment variables. ' +
                      'Pimlico paymaster is REQUIRED for production. ' +
                      'Please add PIMLICO_API_KEY to your Vercel project settings.'
                    console.error('[ZERODEV] ❌', errorMsg)
                    throw new Error(errorMsg)
                  }
                  
                  throw new Error(`Pimlico proxy error: ${response.status} ${errorData.error || 'Unknown error'}`)
                }

                const result = await response.json()
                console.log('[ZERODEV] ✅ Pimlico paymaster response received:', {
                  hasPaymasterAndData: !!result.paymasterAndData,
                  paymasterAndDataLength: result.paymasterAndData?.length || 0,
                  paymasterAndDataPreview: result.paymasterAndData?.substring(0, 20) || 'empty',
                })
                
                // Convert Pimlico response to ZeroDev format
                // GetPaymasterDataReturnType only expects paymasterAndData
                // Gas limits are handled automatically by ZeroDev SDK
                const paymasterAndData = result.paymasterAndData || result.paymasterAndData || '0x'
                
                if (paymasterAndData === '0x' || !paymasterAndData) {
                  console.error('[ZERODEV] ❌ Paymaster returned empty paymasterAndData!')
                  console.error('[ZERODEV] 📋 Full response:', JSON.stringify(result, null, 2))
                  throw new Error('Pimlico paymaster returned empty paymasterAndData. Check that your Pimlico account has sufficient funds and the API key is valid.')
                }
                
                console.log('[ZERODEV] ✅ Returning paymaster data, length:', paymasterAndData.length)
                
                // Return in ZeroDev's expected format
                return {
                  paymasterAndData: paymasterAndData as `0x${string}`,
                }
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.error('[ZERODEV] ❌ Pimlico paymaster error:', errorMessage)
                
                // If Pimlico is not configured, provide helpful error message
                if (errorMessage.includes('Pimlico API key not configured') || 
                    errorMessage.includes('PIMLICO_API_KEY not configured')) {
                  const helpfulError = new Error(
                    'Pimlico paymaster is REQUIRED but not configured. ' +
                    'Please set PIMLICO_API_KEY in your Vercel environment variables. ' +
                    'Get your API key from https://dashboard.pimlico.io. ' +
                    'ZeroDev paymaster does not work on mainnet with free plan.'
                  )
                  console.error('[ZERODEV] 💡 Solution:', helpfulError.message)
                  throw helpfulError
                }
                
                // Re-throw other errors
                throw error
              }
            },
            async getPaymasterStubData(): Promise<GetPaymasterStubDataReturnType> {
              // Return stub data for gas estimation
              // CRITICAL: ZeroDev bundler REJECTS paymasterAndData during gas estimation
              // The error "Unrecognized key: paymasterAndData" occurs if we include it
              // However, the type requires paymasterAndData, so we return empty string
              // The ZeroDev SDK might handle this differently, or we may need to use Pimlico bundler
              // The actual paymaster data will be added later by getPaymasterData when the transaction is sent
              // This is used during gas estimation before the actual userOp is created
              // NOTE: If this still fails, we may need to use Pimlico bundler instead of ZeroDev bundler
              return {
                paymasterAndData: '0x' as `0x${string}`,
              }
            },
        }
        
        // Pimlico client created successfully
        // Note: Actual API call happens when transaction is sent
        console.log('[ZERODEV] ✅ Pimlico paymaster client created', {
          chainId: FORCED_CHAIN.id,
          note: 'Using Pimlico paymaster via secure server-side proxy. ' +
                'IMPORTANT: PIMLICO_API_KEY must be set in Vercel environment variables for production.'
        })
        
        console.log('[ZERODEV] Creating Kernel account client...')
        console.log('[ZERODEV] Paymaster type: Pimlico (REQUIRED)')
        
        // Create Kernel client using ZeroDev SDK
        // Smart wallets are created by ZeroDev, but we use Pimlico for both bundler and paymaster
        // This is required because ZeroDev bundler doesn't support custom paymasters during gas estimation
        const client = createKernelAccountClient({
          account,
          chain: FORCED_CHAIN,
          bundlerTransport: bundlerTransport, // Pimlico bundler via secure proxy (required for Pimlico paymaster)
          paymaster: paymasterClient, // Pimlico paymaster
          client: publicClient,
        })
        
        console.log('[ZERODEV] ✅ Paymaster configured - gasless transactions enabled', {
          paymaster: 'Pimlico (REQUIRED - ZeroDev does not work on mainnet)',
          smartWallets: 'ZeroDev Kernel',
          bundler: 'Smart routing (Gas estimation → ZeroDev, Other methods → Pimlico)',
          chainId: FORCED_CHAIN.id,
          chainName: FORCED_CHAIN.name,
          note: 'Using smart bundler routing: Gas estimation (eth_estimateUserOperationGas) goes to ZeroDev bundler with paymasterAndData stripped. Other methods go to Pimlico bundler. Paymaster is always Pimlico.'
        })
        
        console.log("[ZERODEV] ✅ Smart account client created:", client.account.address)
        
        // Try to get chain ID to verify bundler connection
        // This will fail if PIMLICO_API_KEY is not configured
        try {
          const chainId = await client.getChainId()
          console.log("[ZERODEV] ✅ Chain ID verified:", chainId)
        } catch (chainIdError) {
          console.error("[ZERODEV] ⚠️ Failed to get chain ID (bundler connection test):", chainIdError)
          // Don't fail the entire initialization - the client is still created
          // The error will surface when trying to send a transaction
          if (chainIdError instanceof Error && 
              (chainIdError.message.includes('401') || 
               chainIdError.message.includes('Unauthorized') ||
               chainIdError.message.includes('PIMLICO_API_KEY'))) {
            console.error("[ZERODEV] ❌ Pimlico API key issue detected")
            console.error("[ZERODEV] 💡 Please verify PIMLICO_API_KEY is set correctly in Vercel environment variables")
            console.error("[ZERODEV] 💡 Check: https://dashboard.pimlico.io to verify your API key is active")
          }
        }

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

