import { API_ENDPOINTS } from "./constants";
import type { User } from "firebase/auth";

export async function syncProfile(user: User) {
  try {
    const response = await fetch(API_ENDPOINTS.SYNC_PROFILE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sync profile');
    }
    
    console.log("Profile synced via Edge Function");
  } catch (error) {
    console.error("Error syncing profile:", error);
  }
}
