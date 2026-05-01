import { useState, useEffect } from "react";
import { Search } from "@/components/search";
import { ShowCard } from "@/components/show-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { MediaSection } from "@/components/media-section";
import { WaitlistModal } from "@/components/waitlist-modal";
import { AuthModal } from "@/components/auth-modal";
import { UserDropdown } from "@/components/user-dropdown";
import { SettingsModal } from "@/components/settings-modal";
import { ProfilePage } from "@/components/profile-page";
import { Toaster } from "@/components/ui/toaster";
import { syncProfile } from "@/lib/sync";
import { auth } from "@/lib/firebase";
import { getGoogleCalendarUrl } from "@/lib/calendar";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import type { TVShow, Episode } from "@/types/tvmaze";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Star, Share2, Heart, Bell, Calendar, Play, Check, Zap, User, Lock } from "lucide-react";
import { Helmet } from "react-helmet-async";
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
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        syncProfile(currentUser);
      }
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
      setUpcomingEpisodes(upcoming.slice(1, 13));
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
    <Helmet>
      <title>{selectedShow ? `${selectedShow.name} | TVTRACK` : "TVTRACK | Precise Release Timers"}</title>
      <meta name="description" content={selectedShow?.summary?.replace(/<[^>]*>?/gm, '').slice(0, 150) || "Track your favorite TV shows with precision."} />
    </Helmet>

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
                onClick={() => setIsWaitlistOpen(true)}
              >
                <Zap className="h-4 w-4 fill-primary" /> Upgrade
              </Button>
            )}
            
            {user ? (
              <UserDropdown 
                user={user} 
                isPremium={isPremium} 
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
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

      <WaitlistModal 
        open={isWaitlistOpen} 
        onOpenChange={setIsWaitlistOpen} 
      />
      <AuthModal 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen} 
      />
      <SettingsModal 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
        isPremium={isPremium} 
      />
      {user && (
        <ProfilePage 
          open={isProfileOpen} 
          onOpenChange={setIsProfileOpen} 
          user={user} 
          isPremium={isPremium}
        />
      )}
      <Toaster />

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

                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-14 w-14 rounded-xl border border-border relative group"
                      onClick={() => !isPremium && setIsWaitlistOpen(true)}
                    >
                      <Calendar className="h-5 w-5 text-primary" />
                      {!isPremium && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded whitespace-nowrap">
                        ADD TO CALENDAR (PRO)
                      </div>
                    </Button>

                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-14 w-14 rounded-xl border border-border relative group"
                      onClick={() => !isPremium && setIsWaitlistOpen(true)}
                    >
                      <Bell className="h-5 w-5 text-primary" />
                      {!isPremium && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded whitespace-nowrap">
                        SMART ALERTS (PRO)
                      </div>
                    </Button>
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
              className="py-12 md:py-20 text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-6">
                Track every<br/><span className="text-primary">episode.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Precise, real-time countdowns synchronized with global network schedules. Never miss a release in your local timezone.
              </p>
              
              <div className="flex flex-col gap-20">
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
