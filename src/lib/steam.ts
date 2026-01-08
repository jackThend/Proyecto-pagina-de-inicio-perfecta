// Service to handle Steam Wishlist fetching via Proxy
// Using corsproxy.io as it handles Steam's JSON response better than allorigins

export interface SteamGame {
  name: string;
  capsule: string; // Image URL
  review_score: number;
  review_desc: string;
  reviews_total: string;
  reviews_percent: number;
  release_date: string;
  release_string: string;
  platform_icons: string;
  subs: {
    id: number;
    discount_block: string;
    discount_pct: number;
    price: string;
  }[];
  type: string;
  screenshots: string[];
  review_css: string;
  priority: number;
  added: number;
  background: string;
  rank: number;
  tags: string[];
  is_free_game: boolean;
  win: number;
}

export const fetchSteamWishlist = async (steamId: string): Promise<SteamGame[]> => {
  try {
    // Steam Wishlist JSON endpoint (Public)
    // Format: https://store.steampowered.com/wishlist/profiles/{steamID}/wishlistdata/
    const targetUrl = `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/?p=0`;
    
    // Fallback to allorigins as corsproxy.io is getting blocked (403)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Proxy responded with ${response.status}`);
    }

    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);
    
    // Steam returns an object where keys are AppIDs, we want an array
    // If wishlist is empty or private, data might be [] or have a success:2 error
    if (Array.isArray(data)) {
        return []; // Empty wishlist
    }

    if (data.success === 2) {
        throw new Error('Profile private or invalid');
    }

    const gamesArray = Object.values(data) as SteamGame[];
    
    // Sort by discount (highest first)
    return gamesArray.sort((a, b) => {
      const discountA = a.subs?.[0]?.discount_pct || 0;
      const discountB = b.subs?.[0]?.discount_pct || 0;
      return discountB - discountA;
    });

  } catch (error) {
    console.error("Error fetching Steam wishlist:", error);
    return [];
  }
};
