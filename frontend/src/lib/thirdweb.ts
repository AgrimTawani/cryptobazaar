// thirdweb client — install 'thirdweb' package when integrating wallet connection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThirdwebClient = any

function createThirdwebClient(_opts: { clientId: string }): ThirdwebClient {
  throw new Error('thirdweb package not installed yet')
}

let _client: ThirdwebClient | null = null

export function getThirdwebClient(): ThirdwebClient {
  if (_client) return _client
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
  if (!clientId) throw new Error('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set')
  _client = createThirdwebClient({ clientId })
  return _client
}

export const thirdwebClient = new Proxy({} as ThirdwebClient, {
  get(_, prop) {
    return getThirdwebClient()[prop as keyof ThirdwebClient]
  },
})
