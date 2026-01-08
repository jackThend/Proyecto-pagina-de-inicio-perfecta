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
        // Sort by newest to avoid stale deals from years ago
        const targetUrl = encodeURIComponent('https://www.gamerpower.com/api/giveaways?platform=pc&type=game&sort-by=newest');
        const res = await fetch(`${CORS_PROXY}${targetUrl}`);
        
        if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
        
        const data = await res.json();
        
        if (!data.contents) throw new Error('No content received from proxy');

        let parsedData;
        try {
          parsedData = JSON.parse(data.contents);
        } catch (e) {
          throw new Error('Failed to parse proxy content as JSON');
        }

        const now = new Date();

        const filtered = Array.isArray(parsedData) 
          ? parsedData.filter((deal: GameDeal) => {
              // 1. Status must be active
              if (deal.status !== 'Active') return false;
              
              // 2. If it has an end date, it must be in the future
              if (deal.end_date && deal.end_date !== 'N/A') {
                const endDate = new Date(deal.end_date);
                if (endDate < now) return false;
              }
              
              return true;
            }).slice(0, 10) // Get more items initially to allow filtering
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
