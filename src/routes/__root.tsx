import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Navbar } from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/toaster'
import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { syncProfile } from '@/lib/sync'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider, Helmet } from 'react-helmet-async'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

export const Route = createRootRoute({
  component: RootComponent,
})

function Footer() {
  return (
    <footer className="mt-20 py-12 border-t border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="text-xl font-black tracking-tighter mb-4">
            TV<span className="text-primary">TRACK</span>
          </div>
          <p className="text-muted-foreground max-w-sm">
            The ultimate companion for TV enthusiasts. Never miss an episode with our precise countdowns and global schedules.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/schedule" className="hover:text-primary transition-colors">Weekly Schedule</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Trending Shows</Link></li>
            <li><span className="opacity-50 cursor-not-allowed">Pro Features (Soon)</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/tos" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><a href="mailto:support@tvtrack.app" className="hover:text-primary transition-colors">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground font-medium">
        © 2026 TVTRACK. Powered by TVMaze API. Built for fans, by fans.
      </div>
    </footer>
  );
}

function RootComponent() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) syncProfile(currentUser)
      setIsPremium(!!currentUser)
    })
  }, [])

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col">
          <Helmet>
            <title>TVTRACK | Live TV Show Countdowns</title>
            <meta name="description" content="Track your favorite TV shows with real-time countdowns, global schedules, and personalized watchlists." />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="TVTRACK" />
            <meta name="twitter:card" content="summary_large_image" />
          </Helmet>
          
          <Navbar 
            user={user} 
            isPremium={isPremium} 
          />
          <main className="pt-[72px] flex-1 px-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
          <Footer />
          <Toaster />
          <TanStackRouterDevtools />
          <ReactQueryDevtools />
        </div>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
