import { supabase } from "@/lib/supabase";

export async function fetchWatchlist(userId: string) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("show_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((item) => item.show_id);
}

export async function toggleWatchlistSupabase(userId: string, showId: number, isAdding: boolean) {
  if (isAdding) {
    const { error } = await supabase
      .from("watchlist")
      .insert({ user_id: userId, show_id: showId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("show_id", showId);
    if (error) throw error;
  }
}
