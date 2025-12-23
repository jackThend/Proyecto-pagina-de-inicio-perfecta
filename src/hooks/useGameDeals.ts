import { useState, useEffect } from 'react';

export interface GameDeal {
  id: number;
  title: string;
  thumbnail: string;
  status: string;
  type: string;
  end_date: string;
  platforms: string;
  open_giveaway_url: string;
}

const CORS_PROXY = 'https://api.allorigins.win/get?url=';

export const useGameDeals = () => {
  const [deals, setDeals] = useState<GameDeal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        // GamerPower API via Proxy to avoid CORS
        const targetUrl = encodeURIComponent('https://www.gamerpower.com/api/giveaways?platform=pc&type=game&sort-by=value');
        const res = await fetch(`${CORS_PROXY}${targetUrl}`);
        const data = await res.json();
        const parsedData = JSON.parse(data.contents); // allorigins wraps response in 'contents'

        // Filter for active and interesting platforms
        const filtered = Array.isArray(parsedData) 
          ? parsedData.slice(0, 5) 
          : [];
          
        setDeals(filtered);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return { deals, loading };
};
