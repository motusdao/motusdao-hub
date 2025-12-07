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

// Helper function to format Celo addresses for display
export function formatCeloAddress(address: string, length: number = 6): string {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

// Helper function to get Celo explorer URL
export function getCeloExplorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
  return `${celoMainnet.blockExplorers.default.url}/${type}/${address}`
}
