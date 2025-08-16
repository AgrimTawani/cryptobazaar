import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Simple auth config without database for testing
export const simpleAuthOptions: NextAuthOptions = {
  debug: true, // Enable debug mode
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    }),
  ],  callbacks: {
    session: async ({ session, token }) => {
      console.log("Session callback:", { session, token });
      if (session?.user && token) {
        session.user.id = token.sub!
      }
      return session
    },
    jwt: async ({ user, token }) => {
      console.log("JWT callback:", { user, token });
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
