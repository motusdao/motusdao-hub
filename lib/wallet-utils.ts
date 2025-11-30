import type { ConnectedWallet } from '@privy-io/react-auth'

/**
 * Wallet type identification
 */
export type WalletType = 'smart-wallet' | 'embedded' | 'external'

/**
 * Identifies the smart wallet from a list of Privy wallets.
 * 
 * Smart wallets are contract accounts created automatically by Privy when enabled.
 * They have different addresses from embedded wallets (EOAs).
 * 
 * IMPORTANT: We ALWAYS prefer smart wallet over EOA to ensure gasless transactions work.
 * 
 * @param wallets - Array of Privy wallets (ConnectedWallet[])
 * @returns The smart wallet if found, null otherwise
 */
export function identifySmartWallet(wallets: ConnectedWallet[]): ConnectedWallet | null {
  const privyWallets = wallets.filter(wallet => wallet.walletClientType === 'privy')
  
  if (privyWallets.length === 0) {
    console.log('🔍 No Privy wallets found')
    return null
  }

  // Log all wallets for debugging
  console.log('🔍 All Privy wallets:', privyWallets.map(w => ({
    address: w.address,
    chainId: w.chainId,
    walletClientType: w.walletClientType
  })))

  // When smart wallets are enabled, Privy creates:
  // 1. Embedded wallet (EOA) - address typically starts with 0x1F93... (Privy's deterministic prefix)
  // 2. Smart wallet (contract) - different address, not starting with 0x1F93...
  
  // Smart wallet is the one that is NOT the embedded wallet
  // We identify embedded wallet by the 0x1F93 prefix (Privy's deterministic address)
  const embeddedWallet = identifyEmbeddedWallet(privyWallets)
  
  console.log('🔍 Embedded wallet found:', embeddedWallet?.address)
  
  if (embeddedWallet && privyWallets.length > 1) {
    // If we have an embedded wallet and multiple wallets, find the one that's not the embedded wallet
    const smartWallet = privyWallets.find(
      wallet => wallet.address?.toLowerCase() !== embeddedWallet.address?.toLowerCase()
    )
    if (smartWallet) {
      console.log('✅ Smart wallet identified:', smartWallet.address)
      return smartWallet
    }
  }
  
  // If we have multiple wallets, find the one that doesn't match the embedded pattern
  if (privyWallets.length > 1) {
    const nonEmbedded = privyWallets.find(
      wallet => !wallet.address?.toLowerCase().startsWith('0x1f93')
    )
    if (nonEmbedded) {
      console.log('✅ Smart wallet identified (non-embedded pattern):', nonEmbedded.address)
      return nonEmbedded
    }
  }
  
  // If only one wallet and it's NOT the embedded pattern, it might be the smart wallet
  // (This can happen if smart wallet is created first or if detection is delayed)
  if (privyWallets.length === 1 && !privyWallets[0].address?.toLowerCase().startsWith('0x1f93')) {
    console.log('⚠️ Only one wallet found, not embedded pattern (might be smart wallet):', privyWallets[0].address)
    return privyWallets[0]
  }
  
  console.log('❌ Smart wallet not found. Only embedded wallet or no wallets detected.')
  return null
}

/**
 * Identifies the embedded wallet (EOA) from a list of Privy wallets.
 * 
 * Embedded wallets are Externally Owned Accounts created by Privy.
 * They typically have addresses starting with 0x1F93... (Privy's deterministic prefix).
 * 
 * @param wallets - Array of Privy wallets (ConnectedWallet[])
 * @returns The embedded wallet if found, null otherwise
 */
export function identifyEmbeddedWallet(wallets: ConnectedWallet[]): ConnectedWallet | null {
  const privyWallets = wallets.filter(wallet => wallet.walletClientType === 'privy')
  
  // Embedded wallets typically have addresses starting with 0x1F93... (Privy's deterministic prefix)
  const embeddedWallet = privyWallets.find(wallet => 
    wallet.address?.toLowerCase().startsWith('0x1f93')
  )
  
  return embeddedWallet || null
}

/**
 * Gets the primary wallet address to use for the application.
 * 
 * CRITICAL: We ONLY use smart wallet address. Never use EOA as it won't have gas sponsorship.
 * 
 * Priority:
 * 1. Smart wallet (for gasless transactions via paymaster) - REQUIRED
 * 2. Return null if smart wallet not found (don't fallback to EOA)
 * 
 * @param wallets - Array of Privy wallets (ConnectedWallet[])
 * @returns The smart wallet address to use, or null if smart wallet not found
 */
export function getPrimaryWalletAddress(wallets: ConnectedWallet[]): string | null {
  const smartWallet = identifySmartWallet(wallets)
  if (smartWallet?.address) {
    console.log('✅ Using smart wallet address:', smartWallet.address)
    return smartWallet.address
  }
  
  // DO NOT fallback to embedded wallet - we need smart wallet for gasless transactions
  console.warn('⚠️ Smart wallet not found - cannot use EOA as it won\'t have gas sponsorship')
  return null
}

/**
 * Gets the primary wallet to use for transactions.
 * 
 * CRITICAL: We ONLY use smart wallet. Never use EOA as it won't have gas sponsorship.
 * 
 * Priority:
 * 1. Smart wallet (for gasless transactions via paymaster) - REQUIRED
 * 2. Return null if smart wallet not found (don't fallback to EOA)
 * 
 * @param wallets - Array of Privy wallets (ConnectedWallet[])
 * @returns The smart wallet to use, or null if smart wallet not found
 */
export function getPrimaryWallet(wallets: ConnectedWallet[]): ConnectedWallet | null {
  const smartWallet = identifySmartWallet(wallets)
  if (smartWallet) {
    console.log('✅ Using smart wallet for transactions:', smartWallet.address)
    return smartWallet
  }
  
  // DO NOT fallback to embedded wallet - we need smart wallet for gasless transactions
  console.warn('⚠️ Smart wallet not found - cannot use EOA as it won\'t have gas sponsorship')
  return null
}

/**
 * Determines the wallet type for a given wallet.
 * 
 * @param wallet - The wallet to check
 * @param allWallets - All available wallets (for context)
 * @returns The wallet type
 */
export function getWalletType(wallet: ConnectedWallet | null, allWallets: ConnectedWallet[]): WalletType {
  if (!wallet) {
    return 'external'
  }
  
  if (wallet.walletClientType !== 'privy') {
    return 'external'
  }
  
  const smartWallet = identifySmartWallet(allWallets)
  if (smartWallet && smartWallet.address?.toLowerCase() === wallet.address?.toLowerCase()) {
    return 'smart-wallet'
  }
  
  const embeddedWallet = identifyEmbeddedWallet(allWallets)
  if (embeddedWallet && embeddedWallet.address?.toLowerCase() === wallet.address?.toLowerCase()) {
    return 'embedded'
  }
  
  return 'external'
}

/**
 * Verifies that a smart wallet exists and is ready.
 * 
 * @param wallets - Array of Privy wallets (ConnectedWallet[])
 * @returns Object with verification result and details
 */
export function verifySmartWallet(wallets: ConnectedWallet[]): {
  exists: boolean
  smartWallet: ConnectedWallet | null
  embeddedWallet: ConnectedWallet | null
  message: string
  isCreating: boolean
} {
  const smartWallet = identifySmartWallet(wallets)
  const embeddedWallet = identifyEmbeddedWallet(wallets)
  
  if (smartWallet) {
    return {
      exists: true,
      smartWallet,
      embeddedWallet,
      message: 'Smart wallet found and ready',
      isCreating: false
    }
  }
  
  // If we have an embedded wallet but no smart wallet, it might still be creating
  // Smart wallets are created lazily on first use or may take time to deploy
  if (embeddedWallet) {
    return {
      exists: false,
      smartWallet: null,
      embeddedWallet,
      message: 'Smart wallet not found. It may still be creating, or smart wallets may not be enabled in Privy Dashboard. Please check your Privy Dashboard configuration.',
      isCreating: true // Likely still creating
    }
  }
  
  return {
    exists: false,
    smartWallet: null,
    embeddedWallet,
    message: 'No Privy wallets found',
    isCreating: false
  }
}

