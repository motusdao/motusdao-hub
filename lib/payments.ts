import { createWalletClient, custom, parseUnits, parseEther, encodeFunctionData, type Address } from 'viem'
import { celoMainnet, CELO_STABLE_TOKENS } from './celo'
import { getCeloExplorerUrl } from './celo'
import type { ConnectedWallet } from '@privy-io/react-auth'
import { getPrimaryWallet } from './wallet-utils'
import type { KernelAccountClient } from '@zerodev/sdk'

/**
 * Payment utilities for sending transactions with gas sponsorship
 * Gas fees are automatically sponsored by Pimlico paymaster configured in Privy dashboard
 */

export interface PaymentParams {
  from: Address // User's wallet address
  to: Address // Recipient address (psychologist)
  amount: string // Amount in human-readable format (e.g., "10.5")
  currency: 'CELO' | 'USDT' | 'USDC' | 'cUSD' | 'cEUR' | 'cREAL' | 'cCOP' | 'PSY' | 'MOT' | 'cCAD' // Currency type
}

export interface PaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
  explorerUrl?: string
}

/**
 * Create a wallet client from a Privy wallet
 * This automatically uses the paymaster configured in Privy dashboard for smart wallets
 * 
 * If smart wallet doesn't exist yet, it will be created on first transaction (lazy creation)
 * 
 * @param wallet - The Privy wallet to use (can be embedded wallet - smart wallet will be created automatically)
 * @param allWallets - Optional: all available wallets to identify smart wallet if wallet param is not specified
 * @param allowEOA - If true, allows using EOA to trigger smart wallet creation (default: false)
 */
export async function createPrivyWalletClient(
  wallet: ConnectedWallet, 
  allWallets?: ConnectedWallet[],
  allowEOA: boolean = false
) {
  // Try to get the smart wallet first
  let targetWallet = wallet
  if (allWallets && allWallets.length > 0) {
    const smartWallet = getPrimaryWallet(allWallets)
    if (smartWallet) {
      targetWallet = smartWallet
      console.log('✅ Using existing smart wallet:', targetWallet.address)
    } else if (allowEOA) {
      // If smart wallet doesn't exist and we allow EOA, use embedded wallet
      // This will trigger smart wallet creation on first transaction
      console.log('ℹ️ Smart wallet not found, using embedded wallet to trigger creation')
    } else {
      // If we don't allow EOA and no smart wallet exists, we need to trigger creation
      // For now, we'll use the embedded wallet anyway (Kernel/ZeroDev will create smart wallet)
      console.log('ℹ️ Smart wallet not found yet, will be created on first transaction')
    }
  }
  
  // If it's an EOA and we're not allowing it, check if we should throw
  // But with Kernel/ZeroDev lazy creation, we might need to use EOA to trigger creation
  if (!allowEOA && targetWallet.address?.toLowerCase().startsWith('0x1f93')) {
    // Check if smart wallet exists in allWallets
    if (allWallets && allWallets.length > 0) {
      const smartWallet = getPrimaryWallet(allWallets)
      if (!smartWallet) {
        // No smart wallet exists, but we need to create it
        // With Kernel/ZeroDev, we can use EOA to trigger creation
        console.log('ℹ️ Using EOA to trigger smart wallet creation (Kernel/ZeroDev lazy creation)')
      } else {
        throw new Error('Cannot use EOA for transactions. Smart wallet required for gasless transactions via paymaster.')
      }
    }
  }
  
  const provider = await targetWallet.getEthereumProvider()
  if (!provider) {
    throw new Error('Failed to get wallet provider')
  }

  console.log('✅ Creating wallet client for:', targetWallet.address)

  return createWalletClient({
    account: targetWallet.address as `0x${string}`,
    chain: celoMainnet,
    transport: custom(provider),
  })
}

/**
 * Send a payment in native CELO
 * Gas fees are automatically sponsored by Pimlico paymaster
 * 
 * NOTE: This will trigger smart wallet creation if it doesn't exist yet (Kernel/ZeroDev lazy creation)
 * 
 * @param wallet - The wallet to use (will be converted to smart wallet automatically)
 * @param params - Payment parameters
 * @param allWallets - Optional: all available wallets to identify smart wallet
 * @returns Payment result with transaction hash
 */
export async function sendCELOPayment(
  wallet: ConnectedWallet,
  params: PaymentParams,
  allWallets?: ConnectedWallet[]
): Promise<PaymentResult> {
  try {
    // Check if smart wallet exists - if not, allow EOA to trigger creation
    const hasSmartWallet = allWallets ? getPrimaryWallet(allWallets) !== null : false
    const allowEOA = !hasSmartWallet // Allow EOA if smart wallet doesn't exist yet
    
    // This will get the smart wallet if it exists, or use EOA to trigger creation
    const walletClient = await createPrivyWalletClient(wallet, allWallets, allowEOA)
    const amountInWei = parseUnits(params.amount, 18) // CELO has 18 decimals

    console.log('🔄 Sending transaction to trigger smart wallet creation...')
    const hash = await walletClient.sendTransaction({
      to: params.to,
      value: amountInWei,
    })

    // After transaction, smart wallet should be created
    // The smart wallet address might be different from the account used
    // We'll need to check wallets array after transaction
    console.log('✅ Transaction sent, smart wallet should be created:', hash)

    return {
      success: true,
      transactionHash: hash,
      explorerUrl: getCeloExplorerUrl(hash, 'tx'),
    }
  } catch (error) {
    console.error('❌ Payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    }
  }
}

/**
 * Send a payment in stablecoin (cUSD, cEUR)
 * Requires ERC20 token transfer
 */
export async function sendStablecoinPayment(
  wallet: ConnectedWallet,
  params: PaymentParams
): Promise<PaymentResult> {
  try {
    const walletClient = await createPrivyWalletClient(wallet)
    
    // Get the token address
    const tokenAddress =
      params.currency === 'cUSD'
        ? CELO_STABLE_TOKENS.cUSD
        : CELO_STABLE_TOKENS.cEUR

    // ERC20 transfer function signature: transfer(address to, uint256 amount)
    const amountInWei = parseUnits(params.amount, 18) // Stablecoins have 18 decimals

    // Encode the transfer function call
    const data = encodeFunctionData({
      abi: [
        {
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'transfer',
      args: [params.to, amountInWei],
    })

    const hash = await walletClient.sendTransaction({
      to: tokenAddress,
      data,
    })

    return {
      success: true,
      transactionHash: hash,
      explorerUrl: getCeloExplorerUrl(hash, 'tx'),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    }
  }
}

/**
 * Send a payment using ZeroDev Kernel client (gasless transactions)
 * Supports both native CELO and ERC20 tokens
 * 
 * @param kernelClient - The ZeroDev Kernel account client
 * @param params - Payment parameters
 * @returns Payment result with transaction hash
 */
export async function sendPaymentWithKernel(
  kernelClient: KernelAccountClient,
  params: PaymentParams
): Promise<PaymentResult> {
  try {
    // Validate address
    if (!params.to || !params.to.startsWith('0x') || params.to.length !== 42) {
      return {
        success: false,
        error: 'Dirección de destino inválida',
      }
    }

    // Validate amount
    const amount = parseFloat(params.amount)
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: 'Monto inválido. Debe ser un número mayor a 0',
      }
    }

    // Check if it's native CELO or ERC20 token
    if (params.currency === 'CELO') {
      // Native CELO transfer
      const amountInWei = parseEther(params.amount)

      console.log('🔄 Enviando transacción de CELO usando ZeroDev Kernel...')
      console.log('📍 Destino:', params.to)
      console.log('💰 Monto:', params.amount, 'CELO')

      const userOpHash = await kernelClient.sendUserOperation({
        calls: [{
          to: params.to as `0x${string}`,
          value: amountInWei,
          data: '0x' as `0x${string}`,
        }],
      })

      console.log('✅ User operation enviada, esperando confirmación...', userOpHash)

      // Wait for the user operation to be included
      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash
      })

      const hash = receipt?.receipt?.transactionHash

      if (!hash) {
        throw new Error('No se encontró el hash de transacción en el recibo')
      }

      console.log('✅ Transacción confirmada:', hash)

      return {
        success: true,
        transactionHash: hash,
        explorerUrl: getCeloExplorerUrl(hash, 'tx'),
      }
    } else {
      // ERC20 token transfer
      const tokenAddress = CELO_STABLE_TOKENS[params.currency as keyof typeof CELO_STABLE_TOKENS]
      
      if (!tokenAddress) {
        return {
          success: false,
          error: `Dirección del contrato para ${params.currency} no configurada. Por favor, actualiza lib/celo.ts con la dirección correcta.`,
        }
      }

      // ERC20 transfer function: transfer(address to, uint256 amount)
      const amountInWei = parseUnits(params.amount, 18) // Most tokens have 18 decimals

      const data = encodeFunctionData({
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'transfer',
        args: [params.to as `0x${string}`, amountInWei],
      })

      console.log('🔄 Enviando transacción de token usando ZeroDev Kernel...')
      console.log('📍 Token:', params.currency)
      console.log('📍 Contrato:', tokenAddress)
      console.log('📍 Destino:', params.to)
      console.log('💰 Monto:', params.amount, params.currency)

      const userOpHash = await kernelClient.sendUserOperation({
        calls: [{
          to: tokenAddress as `0x${string}`,
          value: BigInt(0), // No value for ERC20 transfers
          data: data as `0x${string}`,
        }],
      })

      console.log('✅ User operation enviada, esperando confirmación...', userOpHash)

      // Wait for the user operation to be included
      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash
      })

      const hash = receipt?.receipt?.transactionHash

      if (!hash) {
        throw new Error('No se encontró el hash de transacción en el recibo')
      }

      console.log('✅ Transacción confirmada:', hash)

      return {
        success: true,
        transactionHash: hash,
        explorerUrl: getCeloExplorerUrl(hash, 'tx'),
      }
    }
  } catch (error) {
    console.error('❌ Error en el pago:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    // Check for common errors
    if (errorMessage.toLowerCase().includes('fund') || 
        errorMessage.toLowerCase().includes('balance') ||
        errorMessage.toLowerCase().includes('insufficient')) {
      return {
        success: false,
        error: `${errorMessage}. Asegúrate de tener fondos suficientes y que el paymaster esté financiado.`,
      }
    }
    
    // Check for ZeroDev billing limit errors
    if (errorMessage.toLowerCase().includes('monthly') || 
        errorMessage.toLowerCase().includes('sponsorship limit') ||
        errorMessage.toLowerCase().includes('billing plan') ||
        errorMessage.toLowerCase().includes('upgrade your billing')) {
      return {
        success: false,
        error: `⚠️ ZeroDev bloquea mainnet en el plan gratuito.\n\n` +
          `Aunque tengas los contratos fondeados (Verifying: 0x7d5BC7..., ERC20: 0xEb2142...), ` +
          `ZeroDev API no permite usar mainnet sin actualizar el plan.\n\n` +
          `Opciones:\n` +
          `1. Usar Pimlico como paymaster alternativo (recomendado - ver ZERODEV_MAINNET_LIMITATION.md)\n` +
          `2. Actualizar plan de ZeroDev para usar mainnet\n` +
          `3. Usar Alfajores (testnet) para desarrollo`,
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}
