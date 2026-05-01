import { Card, CardContent } from "@/components/ui/card";
import { TVShow } from "@/types/tvmaze";
import { Star } from "lucide-react";

interface ShowCardProps {
  show: TVShow;
  onClick: (show: TVShow) => void;
}

export function ShowCard({ show, onClick }: ShowCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer group border-transparent hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 bg-secondary"
      onClick={() => onClick(show)}
    >
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
        <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-muted-foreground">
          <span>{show.premiered?.split("-")[0] || "TBD"}</span>
          <span>•</span>
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-500 stroke-amber-500" />
            <span>{show.rating?.average || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
