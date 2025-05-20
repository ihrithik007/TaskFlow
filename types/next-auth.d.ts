declare module "next-auth" {
  interface User {
    id: string
    role?: string
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      role?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
}
