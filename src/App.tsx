import { useState, useEffect } from "react";
import { Search } from "@/components/search";
import { ShowCard } from "@/components/show-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { TVShow, Episode } from "@/types/tvmaze";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Star, Link as LinkIcon, Share2, Heart, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRENDING_NAMES = ["House of the Dragon", "The Boys", "The Bear", "Stranger Things", "Invincible", "The Last of Us"];

export default function App() {
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [trending, setTrending] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useLocalStorage<number[]>("watchlist", []);

  useEffect(() => {
    async function loadTrending() {
      try {
        const results = await Promise.all(
          TRENDING_NAMES.map(name => 
            fetch(`https://api.tvmaze.com/singlesearch/shows?q=${name}`).then(res => res.json())
          )
        );
        setTrending(results);
      } catch (error) {
        console.error("Failed to load trending:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  const handleSelectShow = async (show: TVShow) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${show.id}?embed=episodes`);
      const fullShow = await res.json();
      setSelectedShow(fullShow);

      const episodes = fullShow._embedded?.episodes || [];
      const now = new Date();
      const upcoming = episodes.filter((ep: Episode) => {
        const airtime = ep.airstamp ? new Date(ep.airstamp) : new Date(ep.airdate + 'T23:59:59');
        return airtime > now;
      });

      setNextEpisode(upcoming.length > 0 ? upcoming[0] : null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (id: number) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add a toast here
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-[72px] border-b border-border bg-background/80 backdrop-blur-xl z-50 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <a href="/" className="text-xl font-black tracking-tighter flex items-center gap-2 group">
            TV<span className="text-primary group-hover:animate-pulse">TRACK</span>
          </a>
          <Search onSelect={handleSelectShow} />
        </div>
      </nav>

      <main className="pt-[72px] pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {selectedShow ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <div className="grid lg:grid-cols-[350px_1fr] gap-12 bg-secondary/50 rounded-3xl overflow-hidden border border-border shadow-2xl">
                <div className="aspect-[2/3] lg:aspect-auto">
                  <img 
                    src={selectedShow.image?.original || selectedShow.image?.medium} 
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Badge variant="default" className="bg-primary text-primary-foreground font-black px-3 py-1">
                      {nextEpisode ? "Next Episode" : "Completed / Hiatus"}
                    </Badge>
                    <div className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-black">
                      <Star className="h-3 w-3 fill-black" />
                      {selectedShow.rating.average || "N/A"}
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-4">
                    {selectedShow.name}
                  </h1>

                  {nextEpisode && (
                    <p className="text-xl font-medium text-muted-foreground mb-8">
                      Season {nextEpisode.season}, Episode {nextEpisode.number}: "{nextEpisode.name}"
                    </p>
                  )}

                  <div className="prose prose-invert max-w-none text-muted-foreground line-clamp-3 mb-8" 
                       dangerouslySetInnerHTML={{ __html: selectedShow.summary }} />

                  {nextEpisode && (
                    <CountdownTimer targetDate={nextEpisode.airstamp || nextEpisode.airdate + 'T21:00:00'} />
                  )}

                  <div className="flex flex-wrap gap-4 items-center mt-4">
                    <Button 
                      size="lg" 
                      className="rounded-xl font-bold gap-2 px-8 h-14"
                      onClick={shareLink}
                    >
                      <Share2 className="h-4 w-4" /> Share Show
                    </Button>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="rounded-xl font-bold gap-2 h-14 border border-border"
                      onClick={() => toggleWatchlist(selectedShow.id)}
                    >
                      <Heart className={`h-4 w-4 ${watchlist.includes(selectedShow.id) ? "fill-red-500 stroke-red-500" : ""}`} />
                      {watchlist.includes(selectedShow.id) ? "In Watchlist" : "Add to Watchlist"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl border border-border">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="mt-12 p-6 rounded-2xl bg-background/50 border border-border grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">🌍 Original Broadcast</div>
                      <div className="font-bold">
                        {nextEpisode?.airtime || "N/A"} on {selectedShow.network?.name || selectedShow.webChannel?.name} ({selectedShow.network?.country?.name || "US"})
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">📍 Local Time</div>
                      <div className="font-bold">
                        {nextEpisode ? new Date(nextEpisode.airstamp || nextEpisode.airdate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' }) : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-6">
                Track every<br/><span className="text-primary">episode.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Precise, real-time countdowns synchronized with global network schedules. Never miss a release in your local timezone.
              </p>
              <div className="flex justify-center">
                <Search onSelect={handleSelectShow} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trending Section */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tighter">Trending Shows</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : (
              trending.map((show) => (
                <ShowCard key={show.id} show={show} onClick={handleSelectShow} />
              ))
            )}
          </div>
        </section>

        {/* Watchlist Section */}
        {watchlist.length > 0 && !selectedShow && (
           <section className="mt-20">
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-black tracking-tighter">My Watchlist</h2>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-muted-foreground">
             {/* This would need another effect to fetch show data for IDs in watchlist */}
             <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl">
                Your saved shows will appear here.
             </div>
           </div>
         </section>
        )}
      </main>
    </div>
  );
}
