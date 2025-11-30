'use client'

import { useState } from 'react'
import { useWallets, usePrivy } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { celoMainnet } from '@/lib/celo'
import { GlassCard } from '@/components/ui/GlassCard'
import { CTAButton } from '@/components/ui/CTAButton'
import { Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { getCeloExplorerUrl } from '@/lib/celo'
import { getPrimaryWallet, identifySmartWallet, identifyEmbeddedWallet, verifySmartWallet } from '@/lib/wallet-utils'

type TransactionStatus = 'idle' | 'preparing' | 'sending' | 'success' | 'error'

export function TestGaslessTransaction() {
  const { wallets, ready } = useWallets()
  const { authenticated } = usePrivy()
  const [status, setStatus] = useState<TransactionStatus>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Get the smart wallet - this is what we use for gasless transactions
  // Smart wallet is a contract account that supports paymaster gas sponsorship
  const smartWallet = getPrimaryWallet(wallets)
  const embeddedWallet = identifyEmbeddedWallet(wallets)
  const verification = verifySmartWallet(wallets)
  
  // Log wallet information for debugging
  if (ready && wallets.length > 0) {
    console.log('🔍 Wallet verification:', {
      smartWalletExists: verification.exists,
      smartWalletAddress: verification.smartWallet?.address,
      embeddedWalletAddress: verification.embeddedWallet?.address,
      allWallets: wallets.map(w => ({
        address: w.address,
        walletClientType: w.walletClientType,
        chainId: w.chainId,
      }))
    })
  }

  const sendTestTransaction = async () => {
    if (!smartWallet || !ready || !authenticated) {
      const errorMsg = verification.exists 
        ? 'Please connect your wallet first.'
        : 'Wallet not found. Please ensure you are logged in.'
      setError(errorMsg)
      return
    }
    
    // Verify we're using the smart wallet (not embedded wallet)
    const isSmartWallet = identifySmartWallet(wallets)?.address?.toLowerCase() === smartWallet.address?.toLowerCase()
    if (!isSmartWallet && !verification.isCreating) {
      console.warn('⚠️ Using embedded wallet instead of smart wallet. Gasless transactions may not work.')
      // Still allow transaction - smart wallet will be created on first use
    } else if (verification.isCreating) {
      console.log('ℹ️ Smart wallet will be created automatically on this transaction')
    }

    setStatus('preparing')
    setError('')
    setTxHash('')

    try {
      // Get the EIP1193 provider from Privy's smart wallet
      // Smart wallets are contract accounts that support paymaster gas sponsorship
      // This provider automatically uses the paymaster configured in Privy dashboard
      const provider = await smartWallet.getEthereumProvider()
      
      if (!provider) {
        throw new Error('Failed to get wallet provider')
      }

      // Ensure wallet is on Celo Mainnet (chain ID 42220)
      // This is important for paymaster to work correctly
      try {
        const currentChainId = await provider.request({ method: 'eth_chainId' })
        const celoChainId = `0x${celoMainnet.id.toString(16)}` // Convert 42220 to hex: 0xa4ec
        
        if (currentChainId !== celoChainId) {
          // Switch to Celo Mainnet
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: celoChainId }],
          })
        }
      } catch (switchError: any) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${celoMainnet.id.toString(16)}`,
              chainName: celoMainnet.name,
              nativeCurrency: {
                name: celoMainnet.nativeCurrency.name,
                symbol: celoMainnet.nativeCurrency.symbol,
                decimals: celoMainnet.nativeCurrency.decimals,
              },
              rpcUrls: celoMainnet.rpcUrls.default.http,
              blockExplorerUrls: [celoMainnet.blockExplorers.default.url],
            }],
          })
        } else {
          throw switchError
        }
      }

      setStatus('sending')

      // Create a wallet client using Privy's smart wallet provider
      // Smart wallets automatically use the paymaster for gas sponsorship
      const walletClient = createWalletClient({
        account: smartWallet.address as `0x${string}`,
        chain: celoMainnet,
        transport: custom(provider),
      })

      // Send a small test transaction
      // Gas fees will be automatically sponsored by Pimlico paymaster
      // Note: If paymaster is configured correctly in Privy dashboard, 
      // this should be gasless. If you see a gas fee, check Privy dashboard configuration.
      const hash = await walletClient.sendTransaction({
        to: '0x0000000000000000000000000000000000000000', // Burn address for testing
        value: parseEther('0.001'), // Very small amount: 0.001 CELO
      })

      setTxHash(hash)
      setStatus('success')

      // Check transaction on explorer after a delay
      setTimeout(() => {
        window.open(getCeloExplorerUrl(hash, 'tx'), '_blank')
      }, 2000)
    } catch (err) {
      console.error('Transaction error:', err)
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setStatus('error')
    }
  }

  if (!ready) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Loading wallet...</span>
        </div>
      </GlassCard>
    )
  }

  if (!authenticated) {
    return (
      <GlassCard className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Please log in to test gasless transactions</p>
        </div>
      </GlassCard>
    )
  }

  if (!smartWallet) {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-muted-foreground mb-4">
            No wallet found. Please log in with email to get a wallet.
          </p>
        </div>
      </GlassCard>
    )
  }

  // Check if smart wallet exists and is properly configured
  if (!verification.exists) {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {verification.isCreating ? 'Smart Wallet Creating...' : 'Smart Wallet Not Found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {verification.message}
            {verification.isCreating && (
              <span className="block mt-2 text-sm">
                Smart wallets are created automatically but may take a few moments. 
                The smart wallet will be created on the first transaction attempt.
              </span>
            )}
          </p>
          
          {verification.isCreating ? (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-left mb-4">
              <p className="text-sm font-semibold text-blue-400 mb-2">Smart Wallet Creation</p>
              <p className="text-sm text-muted-foreground">
                Privy creates smart wallets automatically when enabled. If this is your first time using the wallet, 
                the smart wallet contract will be deployed on your first transaction. This is normal and expected behavior.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Note:</strong> You can proceed with transactions - the smart wallet will be created automatically 
                when needed. The embedded wallet address shown below will be used until the smart wallet is ready.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-left mb-4">
              <p className="text-sm font-semibold text-yellow-400 mb-2">To enable smart wallets:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer" className="text-mauve-400 hover:underline">Privy Dashboard</a></li>
                <li>Navigate to <strong>Smart Wallets</strong> section</li>
                <li>Enable Smart Wallets for your app</li>
                <li>Configure Celo Mainnet (42220) with:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Bundler URL: <code className="text-xs">https://public.pimlico.io/v2/42220/rpc</code></li>
                    <li>Paymaster URL: <code className="text-xs">https://api.pimlico.io/v2/42220/rpc?apikey=YOUR_KEY</code></li>
                  </ul>
                </li>
                <li>Save and refresh this page</li>
              </ol>
            </div>
          )}
          
          {smartWallet && (
            <div className="p-3 bg-mauve-500/10 rounded-lg border border-mauve-500/20">
              <p className="text-xs text-muted-foreground mb-1">Current Wallet Address:</p>
              <p className="text-xs font-mono">{smartWallet.address}</p>
              {embeddedWallet && (
                <p className="text-xs text-muted-foreground mt-2">
                  Embedded Wallet (EOA): {embeddedWallet.address}
                </p>
              )}
              {verification.isCreating && (
                <p className="text-xs text-blue-400 mt-2">
                  ⏳ Smart wallet will be created automatically on first transaction
                </p>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Test Gasless Transaction</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This will send a small test transaction (0.001 CELO) to verify that the Pimlico paymaster
            is sponsoring gas fees. The transaction should complete without requiring you to pay gas.
          </p>
        </div>

        <div className="p-4 bg-mauve-500/10 rounded-lg border border-mauve-500/20">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Smart Wallet Address:</span>
              <span className="font-mono text-xs">{smartWallet.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet Type:</span>
              <span className="capitalize">
                {verification.exists ? 'Smart Wallet (Contract)' : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chain:</span>
              <span>Celo Mainnet (42220)</span>
            </div>
            {embeddedWallet && embeddedWallet.address !== smartWallet.address && (
              <div className="mt-2 pt-2 border-t border-mauve-500/20">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Embedded Wallet (EOA):</span>
                  <span className="font-mono text-xs text-muted-foreground">{embeddedWallet.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {status === 'idle' && (
          <CTAButton
            onClick={sendTestTransaction}
            className="w-full"
          >
            Send Test Transaction
          </CTAButton>
        )}

        {status === 'preparing' && (
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Preparing transaction...</span>
          </div>
        )}

        {status === 'sending' && (
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Sending transaction (gas should be sponsored)...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Transaction successful!</span>
            </div>
            {txHash && (
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Transaction Hash:</p>
                <div className="flex items-center space-x-2">
                  <code className="text-xs font-mono break-all">{txHash}</code>
                  <a
                    href={getCeloExplorerUrl(txHash, 'tx')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 text-mauve-400 hover:text-mauve-300" />
                  </a>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              ✅ Check the transaction on Celo Explorer. If gas was sponsored, you should see
              that the transaction was paid by the paymaster (not your wallet balance).
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Transaction failed</span>
            </div>
            {error && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <CTAButton
              onClick={sendTestTransaction}
              className="w-full"
            >
              Try Again
            </CTAButton>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

