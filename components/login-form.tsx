"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Github, Facebook, Mail } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Use useEffect to set mounted state to true after component mounts
  // This helps with hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" })
  }

  // Use client-side only rendering to avoid hydration issues
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"></div>
        </div>
        <Button disabled className="w-full">
          Sign in
        </Button>
        <div className="h-10"></div>
        <div className="flex flex-col space-y-2">
          <Button variant="outline" disabled className="w-full">
            Google
          </Button>
          <Button variant="outline" disabled className="w-full">
            GitHub
          </Button>
          <Button variant="outline" disabled className="w-full">
            Facebook
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
          suppressHydrationWarning // Add this to prevent hydration warnings
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
          suppressHydrationWarning // Add this to prevent hydration warnings
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in with Email"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleOAuthSignIn("google")} 
          className="w-full"
        >
          <Mail className="mr-2 h-4 w-4" />
          Google
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleOAuthSignIn("github")} 
          className="w-full"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleOAuthSignIn("facebook")} 
          className="w-full"
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}
