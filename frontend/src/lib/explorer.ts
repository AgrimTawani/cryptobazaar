const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID ?? "137");

const TX_BASE: Record<number, string> = {
  137:   "https://polygonscan.com/tx",
  80002: "https://amoy.polygonscan.com/tx",
};

const ADDR_BASE: Record<number, string> = {
  137:   "https://polygonscan.com/address",
  80002: "https://amoy.polygonscan.com/address",
};

export function txUrl(hash: string) {
  return `${TX_BASE[CHAIN_ID] ?? TX_BASE[137]}/${hash}`;
}

export function addrUrl(address: string) {
  return `${ADDR_BASE[CHAIN_ID] ?? ADDR_BASE[137]}/${address}`;
}
