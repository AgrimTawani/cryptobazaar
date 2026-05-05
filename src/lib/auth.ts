import { SignJWT, jwtVerify } from 'jose'
import { verifySignature } from 'thirdweb/auth'
import { thirdwebClient } from '@/lib/thirdweb'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production-min-32-chars'
)

export function createAuthMessage(walletAddress: string, nonce: string): string {
  return `CryptoBazaar Authentication\n\nWallet: ${walletAddress}\nNonce: ${nonce}\n\nBy signing this message you agree to our Terms of Service.`
}

export async function verifyWalletSignature(
  message: string,
  signature: string,
  walletAddress: string
): Promise<boolean> {
  try {
    return await verifySignature({
      client: thirdwebClient,
      message,
      signature: signature as `0x${string}`,
      address: walletAddress as `0x${string}`,
    })
  } catch {
    return false
  }
}

export async function createSessionToken(walletAddress: string, did: string): Promise<string> {
  return new SignJWT({ walletAddress, did })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifySessionToken(
  token: string
): Promise<{ walletAddress: string; did: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      walletAddress: payload.walletAddress as string,
      did: payload.did as string,
    }
  } catch {
    return null
  }
}
