"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, Plus, Settings, User, Wifi, WifiOff } from "lucide-react"
import { useSocket } from "./socket-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface DashboardHeaderProps {
  user: {
    id: string
    name: string
    email: string
    image?: string
    role?: string
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { isConnected, socket } = useSocket()
  const [stableConnectionState, setStableConnectionState] = useState(true)
  const router = useRouter()
  
  // Debounce the connection state to prevent flickering
  useEffect(() => {
    // If connected, update immediately
    if (isConnected) {
      setStableConnectionState(true)
      return
    }
    
    // If disconnected, wait 5 seconds before showing disconnected state
    // This prevents the indicator from flickering during brief connection issues
    const timer = setTimeout(() => {
      setStableConnectionState(isConnected);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isConnected]);
  
  const handleSignOut = async () => {
    // Disconnect socket first to prevent connection attempts during signout
    if (socket) {
      socket.disconnect();
    }
    
    try {
      // Use redirect: false to handle the redirection ourselves
      await signOut({ redirect: false });
      
      // Manually navigate to login page
      router.push('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Fallback redirection
      window.location.href = '/login';
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-xl font-bold">TaskFlow</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center">
                  {stableConnectionState ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-gray-400" />
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {stableConnectionState
                  ? "Connected: Real-time updates enabled"
                  : "Offline: Updates will sync when reconnected"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback>
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
