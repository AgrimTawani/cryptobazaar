import { defineChain } from 'viem';

export const yellow = defineChain({
  id: 195,
  name: 'Yellow',
  network: 'yellow',
  nativeCurrency: {
    decimals: 18,
    name: 'Yellow',
    symbol: 'YELLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.yellow.org'],
    },
    public: {
      http: ['https://rpc.yellow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Yellow Explorer', url: 'https://explorer.yellow.org' },
  },
  testnet: false,
});
