import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TVShow, Episode } from "@/types/tvmaze";
import { Star, Timer } from "lucide-react";

interface ShowCardProps {
  show: TVShow;
  onClick: (show: TVShow) => void;
}

export function ShowCard({ show, onClick }: ShowCardProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  
  const episodes = show._embedded?.episodes || [];
  const now = new Date();
  const nextEp = episodes.find((ep: Episode) => {
    const airtime = ep.airstamp ? new Date(ep.airstamp) : new Date(ep.airdate + 'T23:59:59');
    return airtime > now;
  });

  useEffect(() => {
    if (!nextEp) return;

    const target = new Date(nextEp.airstamp || nextEp.airdate + 'T21:00:00').getTime();

    const update = () => {
      const diff = target - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("LIVE 🚀");
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);

      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m`);
    };

    update();
    const timer = setInterval(update, 60000); // Update every minute for card efficiency
    return () => clearInterval(timer);
  }, [nextEp]);

  return (
    <Card 
      className="overflow-hidden cursor-pointer group border border-transparent hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 bg-secondary will-change-transform relative"
      onClick={() => onClick(show)}
    >
      {/* Mini Timer Overlay */}
      {timeLeft && (
        <div className="absolute top-2 right-2 z-10 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-xl">
          <Timer className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-black tracking-tight text-white">{timeLeft}</span>
        </div>
      )}

      <div className="aspect-[2/3] overflow-hidden">
        {show.image?.medium ? (
          <img 
            src={show.image.medium} 
            alt={show.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            No Image
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {show.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span>{show.premiered?.split("-")[0] || "TBD"}</span>
            <span>•</span>
            <span className={`px-1 rounded ${show.status === 'Running' ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground bg-secondary/50'}`}>
              {show.status === 'Running' ? 'On' : 'Off'}
            </span>
            <span>•</span>
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-500 stroke-amber-500" />
              <span>{show.rating?.average || "N/A"}</span>
            </div>
          </div>
        </div>
        {nextEp && (
          <div className="mt-2 text-[10px] font-bold text-primary flex items-center gap-1">
             <Badge variant="outline" className="h-4 px-1 text-[9px] font-black border-primary/30 text-primary">
               S{nextEp.season}E{nextEp.number}
             </Badge>
             <span className="line-clamp-1 opacity-60">"{nextEp.name}"</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
