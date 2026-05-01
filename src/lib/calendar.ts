import type { TVShow, Episode } from "@/types/tvmaze";

export function getGoogleCalendarUrl(show: TVShow, episode: Episode | null) {
  if (!episode) return null;
  
  const title = encodeURIComponent(`${show.name} - S${episode.season}E${episode.number}`);
  const startTime = new Date(episode.airstamp || episode.airdate + 'T21:00:00');
  
  // Create an end time 30 mins later
  const endTime = new Date(startTime.getTime() + 30 * 60000);
  
  const formatDate = (date: Date) => 
    date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=Tracked+via+TVTRACK`;
}
