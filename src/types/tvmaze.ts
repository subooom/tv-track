export interface TVShow {
  id: number;
  name: string;
  url: string;
  genres: string[];
  status: string;
  runtime: number;
  premiered: string;
  officialSite: string;
  rating: { average: number | null };
  network: { name: string; country: { name: string } } | null;
  webChannel: { name: string } | null;
  image: { medium: string; original: string } | null;
  summary: string;
  _embedded?: {
    episodes: Episode[];
  };
}

export interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number;
  image: { medium: string; original: string } | null;
  summary: string;
}

export interface SearchResult {
  score: number;
  show: TVShow;
}
