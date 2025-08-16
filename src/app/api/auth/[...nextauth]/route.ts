import NextAuth from "next-auth"
import { simpleAuthOptions } from "@/lib/auth-simple"

const handler = NextAuth(simpleAuthOptions)

export { handler as GET, handler as POST }
