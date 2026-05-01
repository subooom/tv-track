import type { TVShow, Episode } from "@/types/tvmaze";
import { Play, Star, MessageSquare, Info, Lock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MediaSectionProps {
  show: TVShow;
  nextEpisode: Episode | null;
  isPremium: boolean;
  onRequirePremium: () => void;
}

export function MediaSection({ show, isPremium, onRequirePremium }: MediaSectionProps) {
  const trailerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(show.name)}+official+trailer`;

  return (
    <div className="mt-12 space-y-12 pb-20">
      {/* Primary Action */}
      <div className="max-w-md">
        <a href={trailerSearchUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full h-16 bg-white text-black rounded-2xl font-black gap-3 hover:bg-white/90 shadow-xl shadow-white/5">
            <Play className="h-5 w-5 fill-black" /> Watch Official Trailer
          </Button>
        </a>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Info Box */}
        <div className="lg:col-span-2 bg-secondary/30 border border-border rounded-3xl p-8">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Show Metadata
          </h3>
          <div className="grid sm:grid-cols-2 gap-x-12">
            {[
              { label: "Type", value: show.type },
              { label: "Language", value: show.language },
              { label: "Network", value: show.network?.name || show.webChannel?.name },
              { label: "Premiered", value: show.premiered },
              { label: "Runtime", value: `${show.runtime || 60} mins` },
              { label: "Status", value: show.status }
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-4 border-b border-border/50">
                <span className="text-sm font-bold text-muted-foreground">{item.label}</span>
                <span className="font-black text-sm">{item.value || "N/A"}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {show.genres.map(g => (
              <Badge key={g} variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                {g}
              </Badge>
            ))}
          </div>
        </div>

        {/* Pro Teaser Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
          <Badge className="w-fit mb-4 bg-primary text-primary-foreground font-black">PRO INSIGHTS</Badge>
          <h3 className="text-xl font-black mb-4">Unlock the full experience.</h3>
          <ul className="space-y-4 flex-grow">
            {[
              "Real-time streaming availability",
              "Spoiler-free episode titles",
              "Advanced watch statistics",
              "Priority notification delivery"
            ].map(text => (
              <li key={text} className="flex items-start gap-3 text-sm font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                {text}
              </li>
            ))}
          </ul>
          <Button 
            className="mt-8 w-full rounded-xl font-black gap-2 h-12"
            onClick={onRequirePremium}
          >
            Upgrade Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
