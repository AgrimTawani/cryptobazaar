const IDENTUS_AGENT_URL = process.env.IDENTUS_AGENT_URL ?? 'http://localhost:8080'
const IDENTUS_API_KEY = process.env.IDENTUS_API_KEY ?? ''

export function isValidDID(did: string): boolean {
  return typeof did === 'string' && did.startsWith('did:') && did.split(':').length >= 3
}

export async function createDIDForUser(userId: string): Promise<string> {
  if (!process.env.IDENTUS_AGENT_URL) {
    return `did:prism:stub-${userId}-${Date.now()}`
  }

  const response = await fetch(`${IDENTUS_AGENT_URL}/cloud-agent/v1/did-registrar/dids`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: IDENTUS_API_KEY,
    },
    body: JSON.stringify({
      documentTemplate: {
        publicKeys: [
          { id: 'auth-key', purpose: 'authentication' },
          { id: 'issue-key', purpose: 'assertionMethod' },
        ],
        services: [],
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Identus DID creation failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.longFormDid as string
}
