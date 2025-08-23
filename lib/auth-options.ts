
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days - longer session
    updateAge: 24 * 60 * 60, // 24 hours - update session every 24h
  },
  pages: {
    signIn: '/login/escola',
  },
  providers: [
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }
          
          if (credentials.email === "reciclando" && credentials.password === "capacita") {
            return {
              id: "admin",
              email: "admin@capacita.com", 
              name: "Admin",
              role: "admin"
            }
          }
          
          return null
        } catch (error) {
          console.error("Admin auth error:", error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: "student",
      name: "Student", 
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Phone", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const student = await prisma.student.findUnique({
            where: { email: credentials.email.toLowerCase() }
          })

          if (!student) {
            return null
          }

          const phonePassword = credentials.password.replace(/\D/g, '')
          const studentPhone = student.phone?.replace(/\D/g, '') || ""

          if (phonePassword === studentPhone && phonePassword.length >= 8) {
            return {
              id: student.id.toString(),
              email: student.email,
              name: student.name || "",
              role: "student"
            }
          }

          return null
        } catch (error) {
          console.error("Student auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string  
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Permite URLs relativas
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // Permite callbacks na mesma origem
      if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    }
  },
  events: {
    async signIn(message) {
      console.log("SignIn event:", message.user.role)
    },
    async signOut(message) {
      console.log("SignOut event")
    }
  }
}
