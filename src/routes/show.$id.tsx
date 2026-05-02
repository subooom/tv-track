import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { TVShow, Episode } from '@/types/tvmaze'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/countdown-timer'
import { MediaSection } from '@/components/media-section'
import { motion } from 'framer-motion'
import { Share2, Heart, Check, ExternalLink, Info } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { WaitlistModal } from '@/components/waitlist-modal'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const Route = createFileRoute('/show/$id')({
  component: ShowDetailComponent,
})

function ShowDetailComponent() {
  const { id } = Route.useParams()
  const [watchlist, setWatchlist] = useLocalStorage<number[]>("watchlist", [])
  const [recentShows, setRecentShows] = useLocalStorage<number[]>("recently-viewed", [])
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    if (id) {
      const showId = parseInt(id)
      setRecentShows(prev => {
        const filtered = prev.filter(i => i !== showId)
        return [showId, ...filtered].slice(0, 6)
      })
    }
  }, [id])
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setIsPremium(!!u))
  }, [])

  const { data: selectedShow, isLoading, error } = useQuery({
    queryKey: ['show', id],
    queryFn: async () => {
      const res = await fetch(`https://api.tvmaze.com/shows/${id}?embed=episodes`)
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json() as Promise<TVShow & { _embedded: { episodes: Episode[] } }>
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  const episodes = selectedShow?._embedded?.episodes || []
  const now = new Date()
  
  // Filter for current/future episodes only
  const futureEpisodes = episodes.filter((ep: Episode) => {
    const airtime = ep.airstamp ? new Date(ep.airstamp) : new Date(ep.airdate + 'T23:59:59')
    return airtime >= now
  })

  const nextEpisode = futureEpisodes.length > 0 ? futureEpisodes[0] : null

  const toggleWatchlist = (showId: number) => {
    setWatchlist(prev => prev.includes(showId) ? prev.filter(i => i !== showId) : [...prev, showId])
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return <div className="py-20 text-center font-bold text-2xl">Loading show details...</div>
  if (error || !selectedShow) return <div className="py-20 text-center font-bold text-2xl text-red-500">Error loading show details.</div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-12">
      <div className="grid lg:grid-cols-[350px_1fr] gap-12 bg-secondary/50 rounded-3xl overflow-hidden border border-border shadow-2xl">
        <div className="aspect-[2/3] lg:aspect-auto">
          <img src={selectedShow.image?.original || selectedShow.image?.medium || ""} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="default" className="bg-primary text-primary-foreground font-black px-3 py-1">
              {nextEpisode ? "Ongoing / Upcoming" : "Ended / No Upcoming"}
            </Badge>
            {selectedShow.rating?.average && (
              <Badge variant="secondary" className="font-bold">⭐ {selectedShow.rating.average}</Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-4">{selectedShow.name}</h1>
          {nextEpisode && <p className="text-xl font-medium text-muted-foreground mb-8">Next: S{nextEpisode.season}E{nextEpisode.number} - "{nextEpisode.name}"</p>}
          <div className="prose prose-invert max-w-none text-muted-foreground line-clamp-3 mb-8" dangerouslySetInnerHTML={{ __html: selectedShow.summary }} />
          
          {nextEpisode && (
            <div className="mb-8 p-6 bg-background/50 rounded-2xl border border-border/50">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Countdown to Next Episode</p>
              <CountdownTimer targetDate={nextEpisode.airstamp || nextEpisode.airdate + 'T21:00:00'} />
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-center mt-4">
            <Button size="lg" className="rounded-xl font-bold gap-2 px-8" onClick={handleShare}>{copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}{copied ? 'Copied!' : 'Share'}</Button>
            <Button size="lg" variant="secondary" className="rounded-xl font-bold gap-2" onClick={() => toggleWatchlist(selectedShow.id)}><Heart className={`h-4 w-4 ${watchlist.includes(selectedShow.id) ? "fill-red-500" : ""}`} />{watchlist.includes(selectedShow.id) ? "In Watchlist" : "Add"}</Button>
            
            <div className="flex gap-2 ml-auto">
              {selectedShow.externals?.imdb && (
                <Button variant="ghost" size="icon" className="rounded-full bg-secondary" asChild>
                  <a href={`https://www.imdb.com/title/${selectedShow.externals.imdb}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {selectedShow.officialSite && (
                <Button variant="ghost" size="icon" className="rounded-full bg-secondary" asChild>
                  <a href={selectedShow.officialSite} target="_blank" rel="noopener noreferrer">
                    <Info className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {futureEpisodes.length > 1 && (
        <section>
          <h2 className="text-2xl font-black mb-6">Upcoming Episodes</h2>
          <div className="grid gap-4">
            {futureEpisodes.slice(1, 6).map((ep) => (
              <div key={ep.id} className="p-4 bg-secondary/30 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold">S{ep.season}E{ep.number} - {ep.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(ep.airdate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <Badge variant="outline" className="font-bold">{ep.airtime || "TBA"}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      <MediaSection show={selectedShow} nextEpisode={nextEpisode} isPremium={isPremium} onRequirePremium={() => setIsWaitlistOpen(true)} />
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </motion.div>
  )
}
