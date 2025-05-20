import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import FacebookProvider from "next-auth/providers/facebook"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
import { User as AuthUser } from "next-auth"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./mongodb"
import { User } from "@/models/user"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDatabase()

        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-ins (Google, GitHub, Facebook)
      if (account && account.provider && ["google", "github", "facebook"].includes(account.provider)) {
        try {
          await connectToDatabase()

          // Check if user exists with this email
          const existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user from OAuth data
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user", // Default role
              // Store the provider used for sign in
              provider: account.provider
            })

            user.id = newUser._id.toString()
            user.role = newUser.role
          } else {
            user.id = existingUser._id.toString()
            user.role = existingUser.role
            
            // Update user's profile image if it's changed
            if (user.image && user.image !== existingUser.image) {
              await User.updateOne(
                { _id: existingUser._id },
                { $set: { image: user.image } }
              )
            }
          }
        } catch (error) {
          console.error(`Error during ${account.provider} sign in:`, error)
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    }
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}
