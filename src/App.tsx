import { useState, useEffect } from "react";
import { Search } from "@/components/search";
import { ShowCard } from "@/components/show-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { MediaSection } from "@/components/media-section";
import { PricingDialog } from "@/components/pricing-dialog";
import { AuthModal } from "@/components/auth-modal";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import type { TVShow, Episode } from "@/types/tvmaze";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Star, Share2, Heart, Bell, Calendar, Play, Check, Zap, User, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [upcomingEpisodes, setUpcomingEpisodes] = useState<Episode[]>([]);
  const [trending, setTrending] = useState<TVShow[]>([]);
  const [watchlistShows, setWatchlistShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useLocalStorage<number[]>("watchlist", []);
  const [copied, setCopied] = useState(false);
  
  // UI State
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // For now, let's say anyone logged in is "Premium" for the prototype
      setIsPremium(!!currentUser);
    });
  }, []);

  // Deep linking: Load show from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      fetch(`https://api.tvmaze.com/shows/${id}`)
        .then(res => res.json())
        .then(show => handleSelectShow(show));
    }
  }, []);

  // Load Trending from Live Schedule
  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await fetch('https://api.tvmaze.com/schedule?country=US');
        const data = await res.json();
        
        // Deduplicate and filter shows with images
        const uniqueShows = Array.from(new Map(data.map((item: any) => [item.show.id, item.show])).values())
          .filter((show: any) => show.image)
          .sort((a: any, b: any) => (b.rating?.average || 0) - (a.rating?.average || 0))
          .slice(0, 12) as TVShow[];

        setTrending(uniqueShows);
      } catch (error) {
        console.error("Failed to load trending:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  // Load Watchlist Data
  useEffect(() => {
    async function loadWatchlist() {
      if (watchlist.length === 0) {
        setWatchlistShows([]);
        return;
      }
      try {
        const results = await Promise.all(
          watchlist.map(id => 
            fetch(`https://api.tvmaze.com/shows/${id}?embed=episodes`).then(res => res.json())
          )
        );
        setWatchlistShows(results);
      } catch (error) {
        console.error("Failed to load watchlist:", error);
      }
    }
    loadWatchlist();
  }, [watchlist]);

  const handleSelectShow = async (show: TVShow) => {
    setLoading(true);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("id", show.id.toString());
    window.history.pushState({}, "", url.toString());

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
      setUpcomingEpisodes(upcoming.slice(1, 13)); // Next 12 after the immediate one
      
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

  const goHome = () => {
    setSelectedShow(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.pushState({}, "", url.pathname);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-[72px] border-b border-border bg-background/80 backdrop-blur-xl z-50 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-8">
          <button onClick={goHome} className="text-xl font-black tracking-tighter flex items-center gap-2 group cursor-pointer flex-shrink-0">
            TV<span className="text-primary group-hover:animate-pulse">TRACK</span>
          </button>
          
          <div className="flex-1 max-w-xl hidden md:block">
            <Search onSelect={handleSelectShow} />
          </div>

          <div className="flex items-center gap-4">
            {!isPremium && (
              <Button 
                variant="outline" 
                className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/10 rounded-full font-bold gap-2"
                onClick={() => setIsPricingOpen(true)}
              >
                <Zap className="h-4 w-4 fill-primary" /> Upgrade
              </Button>
            )}
            
            {user ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-secondary overflow-hidden border border-border"
                onClick={() => signOut(auth)}
              >
                 {user.photoURL ? (
                   <img src={user.photoURL} className="h-full w-full object-cover" alt="" />
                 ) : (
                   <User className="h-5 w-5" />
                 )}
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-secondary"
                onClick={() => setIsAuthOpen(true)}
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing & Auth Modals */}
      <PricingDialog 
        open={isPricingOpen} 
        onOpenChange={setIsPricingOpen} 
        onUpgrade={() => {
          setIsPricingOpen(false);
          setIsAuthOpen(true);
        }}
      />
      <AuthModal 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen} 
      />

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
                      {selectedShow.rating?.average || "N/A"}
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
                      className="rounded-xl font-bold gap-2 px-8 h-14 min-w-[160px] transition-all"
                      onClick={handleShare}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4" />
                          Share Show
                        </>
                      )}
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

                    {/* Pro Calendar */}
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-14 w-14 rounded-xl border border-border relative group"
                      onClick={() => !isPremium && setIsPricingOpen(true)}
                    >
                      <Calendar className="h-5 w-5 text-primary" />
                      {!isPremium && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded whitespace-nowrap">
                        ADD TO CALENDAR (PRO)
                      </div>
                    </Button>

                    {/* Pro Alerts */}
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-14 w-14 rounded-xl border border-border relative group"
                      onClick={() => !isPremium && setIsPricingOpen(true)}
                    >
                      <Bell className="h-5 w-5 text-primary" />
                      {!isPremium && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded whitespace-nowrap">
                        SMART ALERTS (PRO)
                      </div>
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

              {/* Upcoming Episodes Grid */}
              {upcomingEpisodes.length > 0 && (
                <section className="mt-20">
                  <h2 className="text-2xl font-black tracking-tighter mb-8 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    Future Episodes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEpisodes.map((ep) => (
                      <div key={ep.id} className="bg-secondary/30 border border-border rounded-2xl p-6 flex gap-4 items-center hover:bg-secondary/50 transition-colors">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-black">
                          {ep.season}x{ep.number}
                        </div>
                        <div>
                          <div className="font-bold line-clamp-1">{ep.name}</div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {new Date(ep.airstamp || ep.airdate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <MediaSection 
                show={selectedShow} 
                nextEpisode={nextEpisode}
                isPremium={isPremium}
                onRequirePremium={() => setIsPricingOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 md:py-20 text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-6">
                Track every<br/><span className="text-primary">episode.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Precise, real-time countdowns synchronized with global network schedules. Never miss a release in your local timezone.
              </p>
              
              <div className="flex flex-col gap-20">
                {/* Watchlist Section */}
                {watchlistShows.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        My Watchlist
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                      {watchlistShows.map((show) => (
                        <ShowCard key={show.id} show={show} onClick={handleSelectShow} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Trending Section */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                      <Play className="h-6 w-6 text-primary fill-primary" />
                      Trending Shows
                    </h2>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
