// Ultimate RSS Fetcher (Restored to stable version without timeouts)
// Tries multiple services to bypass CORS and parsing errors

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  sourceName?: string;
  feedId?: string;
  image?: string;
}

// Helper to extract image from HTML string
const extractImage = (html: string): string => {
  if (!html) return '';
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = html.match(imgRegex);
  return match ? match[1] : '';
};

// Generic Fetcher with Retry Logic
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 1): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      // If server error (5xx) or timeout (408, 504) or rate limit (429), throw to retry
      if ([408, 429, 500, 502, 503, 504].includes(res.status)) throw new Error(`Status ${res.status}`);
      return res; // Return 404s etc as is, no point retrying
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      // Wait 1s before retry
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

// Method 1: RSS2JSON
const fetchViaRss2Json = async (url: string, feedName: string): Promise<FeedItem[]> => {
  const response = await fetchWithRetry(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
  const data = await response.json();
  if (data.status !== 'ok') throw new Error('RSS2JSON failed');

  return data.items.map((item: any) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    contentSnippet: (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 160) + '...', 
    content: item.content,
    isoDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    sourceName: feedName,
    image: item.enclosure?.link || item.thumbnail || extractImage(item.description || '') || extractImage(item.content || '')
  }));
};

// Method 2: CorsProxy (Direct XML)
const fetchViaCorsProxy = async (url: string, feedName: string): Promise<FeedItem[]> => {
  const response = await fetchWithRetry(`https://corsproxy.io/?${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('CorsProxy failed');
  const text = await response.text();
  
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  if (xml.querySelector('parsererror')) throw new Error('XML parsing failed');

  return Array.from(xml.querySelectorAll("item, entry")).map(item => {
    const title = item.querySelector("title")?.textContent || 'Sin título';
    const link = item.querySelector("link")?.textContent || item.querySelector("link")?.getAttribute("href") || '#';
    const pubDate = item.querySelector("pubDate, published, updated")?.textContent || '';
    const description = item.querySelector("description, summary")?.textContent || '';
    const content = item.querySelector("content\:encoded, content")?.textContent || description;
    
    let image = item.querySelector("media\:content, content")?.getAttribute("url") || 
                item.querySelector("enclosure")?.getAttribute("url") ||
                extractImage(description) || 
                extractImage(content);

    return {
      title,
      link,
      pubDate,
      contentSnippet: description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...', 
      isoDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      sourceName: feedName,
      image
    };
  });
};

// Method 3: AllOrigins (XML via JSON Proxy)
const fetchViaAllOrigins = async (url: string, feedName: string): Promise<FeedItem[]> => {
  const response = await fetchWithRetry(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  const data = await response.json();
  if (!data.contents) throw new Error('AllOrigins no content');

  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, "text/xml");
  if (xml.querySelector('parsererror')) throw new Error('XML parsing failed');

  return Array.from(xml.querySelectorAll("item, entry")).map(item => {
    const title = item.querySelector("title")?.textContent || 'Sin título';
    const link = item.querySelector("link")?.textContent || item.querySelector("link")?.getAttribute("href") || '#';
    const pubDate = item.querySelector("pubDate, published, updated")?.textContent || '';
    const description = item.querySelector("description, summary")?.textContent || '';
    const content = item.querySelector("content\:encoded, content")?.textContent || description;
    
    let image = item.querySelector("media\:content, content")?.getAttribute("url") || 
                item.querySelector("enclosure")?.getAttribute("url") ||
                extractImage(description) || 
                extractImage(content);

    return {
      title,
      link,
      pubDate,
      contentSnippet: description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...', 
      isoDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      sourceName: feedName,
      image
    };
  });
};

export const fetchFeed = async (url: string, feedName: string): Promise<FeedItem[]> => {
  const trimmedUrl = url.trim();

  // Strategy 1: AllOrigins (Most compatible)
  try {
    return (await fetchViaAllOrigins(trimmedUrl, feedName)).slice(0, 50);
  } catch (err) {
    // Continue to next strategy
  }

  // Strategy 2: CorsProxy (Faster direct XML)
  try {
     return (await fetchViaCorsProxy(trimmedUrl, feedName)).slice(0, 50);
  } catch (err2) {
     // Continue
  }

  // Strategy 3: RSS2JSON (Last resort, strictest limits)
  try {
    return (await fetchViaRss2Json(trimmedUrl, feedName)).slice(0, 50);
  } catch (err3) {
    console.error(`All strategies failed for ${feedName}`);
    return [];
  }
};
