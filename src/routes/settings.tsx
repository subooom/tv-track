import { createFileRoute } from '@tanstack/react-router'
import { SettingsModal } from '@/components/settings-modal'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const Route = createFileRoute('/settings')({
  component: SettingsRoute,
})

function SettingsRoute() {
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setIsPremium(!!u))
  }, [])

  return (
    <div className="py-12">
      <SettingsModal isPremium={isPremium} isPage={true} />
    </div>
  )
}
