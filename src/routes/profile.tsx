import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/components/profile-page'
import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
})

function ProfileRoute() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u))
  }, [])

  if (!user) return <div className="py-20 text-center font-bold">Please log in to view your profile.</div>

  return (
    <div className="py-12">
       <ProfilePage user={user} isPremium={true} isPage={true} />
    </div>
  )
}
