// Service to handle Steam Wishlist fetching via Proxy
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

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
    const targetUrl = encodeURIComponent(`https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/?p=0`);
    const response = await fetch(`${CORS_PROXY}${targetUrl}`);
    const data = await response.json();
    
    // The API returns contents as a string inside the proxy wrapper
    const parsedContents = JSON.parse(data.contents);

    // Steam returns an object where keys are AppIDs, we want an array
    const gamesArray = Object.values(parsedContents) as SteamGame[];
    
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
