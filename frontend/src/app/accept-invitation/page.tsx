'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { acceptProjectInvitation } from '@/services/project.service'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from "@/context/AuthContext";  

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
 const { user } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)



  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invitation link. No token provided.')
      return
    }

    acceptInvitation()
  }, [token])

  const acceptInvitation = async () => {
    if (!token) return

    try {
      const result = await acceptProjectInvitation(token)
      
      setStatus('success')
      setMessage(result.message)
      setProjectId(result.project_id)
      setProjectName(result.project_name)

      // Redirect to project after 3 seconds
      setTimeout(() => {
        router.push(`/projects/${result.project_id}/overview`)
      }, 3000)
    } catch (error) {
      setStatus('error')
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('Failed to accept invitation. The link may be invalid or expired.')
      }
    }
  }
if(!user){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-md w-full bg-card border rounded-xl shadow-lg p-8 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Invitation Failed</h1>
            <p className="text-muted-foreground mb-6">You must be logged in to accept an invitation.</p>
            <div className="space-y-2">
                <Button
                    onClick={() => router.push('/login')}
                    className="w-full bg-gradient-primary"
                >
                    Go to Login
                </Button>
                <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="w-full"
                >
                    Back to Home
                </Button>
            </div>
        </div>
    </div>
  )
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-md w-full bg-card border rounded-xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
            <h1 className="text-2xl font-bold mb-2">Accepting Invitation...</h1>
            <p className="text-muted-foreground">Please wait while we process your invitation</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome Aboard!</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            {projectName && (
              <p className="text-sm font-medium mb-6">
                You've joined <span className="text-primary">{projectName}</span> as a Visitor
              </p>
            )}
            <p className="text-xs text-muted-foreground mb-4">Redirecting you to the project...</p>
            <Button 
              onClick={() => projectId && router.push(`/projects/${projectId}`)}
              className="bg-gradient-primary"
            >
              Go to Project Now
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Invitation Failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/projects')}
                className="w-full bg-gradient-primary"
              >
                Go to My Projects
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
