import axios from 'axios';

const fallbackImages = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
  'https://images.unsplash.com/photo-1598327773204-3c98ecb22a89?w=600',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600'
];

export const searchProductImages = async (query: string) => {
  try {
    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCse = process.env.GOOGLE_CSE_ID;

    if (googleKey && googleCse) {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: googleKey,
          cx: googleCse,
          q: query,
          searchType: 'image',
          num: 6,
          safe: 'active'
        }
      });

      const items = response.data.items || [];
      const links = items.map((item: any) => item.link).filter(Boolean);
      if (links.length) return links;
    }

    if (process.env.UNSPLASH_ACCESS_KEY) {
      const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: {
          query,
          per_page: 5,
          orientation: 'squarish'
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      });

      return response.data.results.map((img: any) => img.urls.regular);
    }

    return fallbackImages;
  } catch (error) {
    console.error('Image search failed:', error);
    return fallbackImages;
  }
};
