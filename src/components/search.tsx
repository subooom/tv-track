import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { TVShow, SearchResult } from "@/types/tvmaze";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchProps {
  onSelect: (show: TVShow) => void;
}

export function Search({ onSelect }: SearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative h-10 w-full max-w-[450px] flex items-center justify-between rounded-full bg-secondary px-4 border border-border hover:border-primary/50 transition-all text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4" />
          <span className="text-sm">Search any show...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search shows..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={result.show.id}
                onSelect={() => {
                  onSelect(result.show);
                  setOpen(false);
                }}
                className="flex items-center gap-4 p-2 cursor-pointer"
              >
                {result.show.image?.medium && (
                  <img 
                    src={result.show.image.medium} 
                    alt={result.show.name} 
                    className="h-12 w-8 rounded object-cover"
                  />
                )}
                <div className="flex flex-col">
                  <span className="font-bold">{result.show.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {result.show.premiered?.split("-")[0]} • ⭐ {result.show.rating?.average || "N/A"}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
