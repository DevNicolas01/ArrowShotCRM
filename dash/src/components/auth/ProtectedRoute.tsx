import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'
import { FullPageSpinner } from '../ui/FullPageSpinner'

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode
  allowedRoles?: UserRole[]
}) {
  const { firebaseUser, profile, loading, signOut } = useAuth()

  const isDeactivated = !!profile && !profile.active

  useEffect(() => {
    if (isDeactivated) {
      toast.error('Sua conta foi desativada. Fale com um admin do CRM.')
      signOut()
    }
  }, [isDeactivated, signOut])

  if (loading) return <FullPageSpinner />
  if (!firebaseUser) return <Navigate to="/login" replace />
  if (!profile || isDeactivated) return <FullPageSpinner label="Preparando seu acesso..." />
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
