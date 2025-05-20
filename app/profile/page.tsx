"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import { Upload, X } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  // Use useEffect for initialization and navigation
  useEffect(() => {
    setMounted(true)
    
    // Redirect if not authenticated
    if (!session && mounted) {
      router.push("/login")
    }
  }, [session, router, mounted])

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      })
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return
    }

    // Create a preview
    const reader = new FileReader()
    
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string)
        toast({
          title: "Image selected",
          description: "Click 'Save Changes' to update your profile picture",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the image file. Please try another image.",
        variant: "destructive",
      })
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const clearFileSelection = () => {
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsLoading(true)
    try {
      // Set updatedImage only if avatarPreview exists
      const updatedImage = avatarPreview || session?.user?.image;
      
      // Send update to API
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          image: updatedImage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      // Create a notification message
      let updateMessage = "Your name has been updated.";
      if (avatarPreview) {
        updateMessage = "Your profile picture and name have been updated.";
      }
      
      // Update session after the API call succeeds
      await update({
        ...session,
        user: {
          ...session?.user,
          name: values.name,
          image: updatedImage,
        },
      });
      
      toast({
        title: "Profile Updated Successfully",
        description: updateMessage,
      });
      
      // Force a refresh to show the updated profile
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // If not mounted yet or no session, return minimal UI
  if (!mounted || !session) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          <p>Loading profile...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {session.user && <DashboardHeader user={session.user as any} />}
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Your avatar is visible to other users.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={session.user?.name || "User"} />
                  ) : (
                    <AvatarImage 
                      src={session.user?.image || undefined} 
                      alt={session.user?.name || "User"} 
                    />
                  )}
                  <AvatarFallback className="text-2xl">
                    {session.user?.name
                      ? session.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                {avatarPreview && (
                  <button
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1"
                    onClick={clearFileSelection}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={triggerFileInput} 
                    className="flex-1 flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {avatarPreview ? "Change Image" : "Upload Image"}
                  </Button>
                  
                  {avatarPreview && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      type="button" 
                      onClick={clearFileSelection}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Recommended: Square image, max 5MB (JPG, PNG)
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          Your email address cannot be changed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 