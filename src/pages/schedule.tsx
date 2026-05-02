import { Calendar, ChevronLeft, ChevronRight, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRIES = [
  { label: "United States", code: "US" },
  { label: "United Kingdom", code: "GB" },
  { label: "Canada", code: "CA" },
  { label: "Australia", code: "AU" },
  { label: "Germany", code: "DE" },
  { label: "France", code: "FR" },
];

interface SchedulePageProps {
  data: any[];
  loading: boolean;
  scheduleDay: number;
  setScheduleDay: (day: number | ((prev: number) => number)) => void;
  country: string;
  setCountry: (country: string) => void;
  handleSelectShow: (show: any) => void;
}

export function SchedulePage({ 
  data, 
  loading, 
  scheduleDay, 
  setScheduleDay, 
  country, 
  setCountry, 
  handleSelectShow 
}: SchedulePageProps) {
  return (
    <section className="py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          {new Date(new Date().setDate(new Date().getDate() + scheduleDay)).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </h2>
        
        <div className="flex items-center gap-3">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[180px] rounded-full bg-secondary border-border">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setScheduleDay(prev => prev - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setScheduleDay(prev => prev + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground font-bold">No shows scheduled for this day/country.</div>
          ) : data.map((item: any) => (
            <div 
              key={item.id} 
              className="bg-secondary/30 rounded-2xl p-4 hover:bg-secondary/60 transition-colors border border-border flex gap-4 cursor-pointer group" 
              onClick={() => item.show && handleSelectShow(item.show)}
            >
              {item.show?.image?.medium ? (
                <div className="relative shrink-0 overflow-hidden rounded-lg">
                  <img src={item.show.image.medium} className="w-16 h-24 object-cover group-hover:scale-110 transition-transform duration-500" alt={item.show.name} />
                </div>
              ) : (
                <div className="w-16 h-24 rounded-lg bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-bold shrink-0">No Image</div>
              )}
              <div className="text-left py-1 overflow-hidden flex flex-col justify-between">
                <div>
                  <p className="font-black text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.show?.name || "Untitled Show"}</p>
                  <p className="text-xs text-muted-foreground font-bold">S{item.season || 0}E{item.number || 0}</p>
                  <p className="text-[11px] font-medium text-muted-foreground line-clamp-1 mt-1 italic">"{item.name}"</p>
                </div>
                <p className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded w-fit">{item.airtime || "TBA"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
