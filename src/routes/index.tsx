import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ShowCard } from '@/components/show-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { motion } from 'framer-motion'
import type { TVShow } from '@/types/tvmaze'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const [watchlist] = useLocalStorage<number[]>("watchlist", [])
  const [recentIds] = useLocalStorage<number[]>("recently-viewed", [])
  const navigate = useNavigate()

  // Cached trending shows
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await fetch('https://api.tvmaze.com/schedule?country=US')
      const data = await res.json()
      return Array.from(new Map(data.map((item: any) => [item.show.id, item.show])).values())
        .filter((show: any) => show.image)
        .sort((a: any, b: any) => (b.rating?.average || 0) - (a.rating?.average || 0))
        .slice(0, 12) as TVShow[]
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // Cached watchlist details
  const { data: watchlistShows, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlist-shows', watchlist],
    queryFn: async () => {
      if (watchlist.length === 0) return []
      return Promise.all(
        watchlist.map(id => fetch(`https://api.tvmaze.com/shows/${id}?embed=episodes`).then(res => res.json()))
      ) as Promise<TVShow[]>
    },
    enabled: watchlist.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  // Cached recently viewed
  const { data: recentShows, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-shows', recentIds],
    queryFn: async () => {
      if (recentIds.length === 0) return []
      return Promise.all(
        recentIds.map(id => fetch(`https://api.tvmaze.com/shows/${id}`).then(res => res.json()))
      ) as Promise<TVShow[]>
    },
    enabled: recentIds.length > 0,
    staleTime: 1000 * 60 * 30,
  })

  const handleSelectShow = (show: TVShow) => {
    navigate({ to: '/show/$id', params: { id: show.id.toString() } })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 md:py-20 text-center">
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-6">
        Track every<br/><span className="text-primary">episode.</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
        Precise, real-time countdowns synchronized with global network schedules.
      </p>
      
      <div className="flex flex-col gap-20">
        {watchlist.length > 0 && (
          <section>
            <h2 className="text-2xl font-black mb-8 text-left">My Watchlist</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {watchlistLoading 
                ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
                : watchlistShows?.map((show) => (
                    <ShowCard key={show.id} show={show} onClick={handleSelectShow} />
                  ))
              }
            </div>
          </section>
        )}

        {recentIds.length > 0 && (
          <section>
            <h2 className="text-2xl font-black mb-8 text-left">Jump Back In</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {recentLoading 
                ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)
                : recentShows?.map((show) => (
                    <ShowCard key={show.id} show={show} onClick={handleSelectShow} />
                  ))
              }
            </div>
          </section>
        )}
        
        <section>
          <h2 className="text-2xl font-black mb-8 text-left">Trending Shows</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trendingLoading 
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />) 
              : trending?.map((show) => <ShowCard key={show.id} show={show} onClick={handleSelectShow} />)
            }
          </div>
        </section>
      </div>
    </motion.div>
  )
}
