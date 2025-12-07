import { defineChain } from 'viem'

// Celo Mainnet Configuration
export const celoMainnet = defineChain({
  id: 42220,
  name: 'Celo',
  network: 'celo',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
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
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13112599,
    },
  },
})

// Celo Alfajores Testnet Configuration
export const celoAlfajores = defineChain({
  id: 44787,
  name: 'Celo Alfajores',
  network: 'alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
    public: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Alfajores Explorer',
      url: 'https://alfajores.celoscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 6900000,
    },
  },
})

// Stable token addresses on Celo Mainnet
// NOTE: Some addresses may need to be verified/updated
export const CELO_STABLE_TOKENS = {
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
  cCOP: '0x8a567e2ae79ca692bd748ab832081c45de4041ea', // Celo Peso Colombiano - VERIFY ADDRESS
  cCAD: '0xff4Ab19391af240c311c54200a492233052B6325', // Celo Canadian Dollar - VERIFY ADDRESS
  USDT: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', // Tether USD on Celo - VERIFY ADDRESS
  USDC: '0xceba9300f2b948710d2653dd7b07f33a8b32118c', // USD Coin on Celo - VERIFY ADDRESS
  PSY: '0x249c893c4ef4f929ff2a08bc81f70f59ca902a20', // Psychology Token - UPDATE WITH ACTUAL ADDRESS
  MOT: '0xc39000920debd2aae90a08006cf9d013e2b1083b', // Motus Token - UPDATE WITH ACTUAL ADDRESS
} as const

// Stable token addresses on Celo Alfajores Testnet
export const CELO_ALFAJORES_STABLE_TOKENS = {
  cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
  cREAL: '0xE4D517785D091D3c54818832dB6094bcc2744545',
  cCOP: '0x0000000000000000000000000000000000000000', // UPDATE WITH TESTNET ADDRESS
  cCAD: '0x0000000000000000000000000000000000000000', // UPDATE WITH TESTNET ADDRESS
  USDT: '0x0000000000000000000000000000000000000000', // UPDATE WITH TESTNET ADDRESS
  USDC: '0x0000000000000000000000000000000000000000', // UPDATE WITH TESTNET ADDRESS
  PSY: '0x0000000000000000000000000000000000000000', // UPDATE WITH TESTNET ADDRESS
  MOT: '0x0000000000000000000000000000000000000000', // UPDATE WITH TESTNET ADDRESS
} as const

// Helper function to get the appropriate chain based on environment
export function getCeloChain() {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? celoMainnet : celoAlfajores
}

// Helper function to get stable token addresses based on environment
export function getStableTokenAddresses() {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? CELO_STABLE_TOKENS : CELO_ALFAJORES_STABLE_TOKENS
}

// Helper function to format Celo addresses for display
export function formatCeloAddress(address: string, length: number = 6): string {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

// Helper function to get Celo explorer URL
export function getCeloExplorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
  const chain = getCeloChain()
  return `${chain.blockExplorers.default.url}/${type}/${address}`
}
