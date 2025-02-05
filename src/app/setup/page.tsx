'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useToast } from "@/hooks/use-toast"
// import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "../../components/ui/login-form"

export default function Setup() {
  const { isConnected } = useAppKitAccount()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to access the setup page",
        variant: "destructive",
        duration: 2000,
      })
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-primary-gradient p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
       
        <LoginForm />
      </div>
    </div>
  )
}
