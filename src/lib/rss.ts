// Custom RSS Parser using native Browser APIs
// This avoids heavy Node.js dependencies that crash the browser

const CORS_PROXY = 'https://api.allorigins.win/get?url=';

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  sourceName?: string;
  feedId?: string;
}

export const fetchFeed = async (url: string, feedName: string): Promise<FeedItem[]> => {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) throw new Error('No content found');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data.contents, "text/xml");
    
    const items = Array.from(xmlDoc.querySelectorAll("item, entry"));

    return items.map(item => {
      // Handle both RSS (item) and Atom (entry) formats
      const title = item.querySelector("title")?.textContent || 'Sin título';
      
      // Link can be a tag text or href attribute
      let link = item.querySelector("link")?.textContent;
      if (!link) {
         link = item.querySelector("link")?.getAttribute("href") || '#';
      }

      const pubDate = item.querySelector("pubDate, published")?.textContent || '';
      const description = item.querySelector("description, summary")?.textContent || '';
      const content = item.querySelector("content\\:encoded, content")?.textContent || description;

      return {
        title,
        link,
        pubDate,
        contentSnippet: description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...', // Strip HTML
        content,
        isoDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        sourceName: feedName
      };
    });

  } catch (error) {
    console.error(`Error fetching feed ${url}:`, error);
    return [];
  }
};
