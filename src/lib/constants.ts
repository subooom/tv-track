export const API_ENDPOINTS = {
  // Edge Functions
  SYNC_PROFILE: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-profile`,
  STRIPE_PORTAL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-link`,
}