import axios from 'axios';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const uniqueUrls = (urls: string[]) => Array.from(new Set(urls.filter(Boolean)));
const MAX_IMAGE_RESULTS = 24;

const getAxiosErrorSummary = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (!axios.isAxiosError(error)) {
    return 'Unknown request error';
  }

  const status = error.response?.status;
  const apiMessage =
    (error.response?.data as any)?.errors?.[0] ||
    (error.response?.data as any)?.error ||
    error.message ||
    'Request failed';

  return status ? `${status} ${apiMessage}` : apiMessage;
};

const buildSearchQuery = (query: string) => {
  const tokens = normalize(query)
    .split(' ')
    .filter(token => token.length > 1);

  if (!tokens.length) {
    return query.trim();
  }

  return tokens.join(' ');
};

const buildQueryVariants = (query: string) => {
  const normalized = normalize(query);
  const tokens = normalized.split(' ').filter(Boolean);
  const variants = new Set<string>();

  const push = (...values: Array<string | undefined | null>) => {
    values.forEach(value => {
      const cleaned = value?.trim();
      if (cleaned) {
        variants.add(cleaned);
      }
    });
  };

  const hasCharger = tokens.includes('charger') || tokens.includes('charging');
  const hasCable = tokens.includes('cable') || tokens.includes('cord') || tokens.includes('wire');
  const hasPc = tokens.includes('pc') || tokens.includes('computer') || tokens.includes('desktop');
  const hasLaptop = tokens.includes('laptop') || tokens.includes('notebook');
  const hasPhone = tokens.includes('phone') || tokens.includes('mobile') || tokens.includes('smartphone');

  const brand = tokens.find(token =>
    ['hp', 'dell', 'lenovo', 'asus', 'acer', 'samsung', 'apple', 'huawei', 'tecno', 'infinix', 'oppo', 'vivo'].includes(token)
  );

  if (hasCharger && hasCable) {
    push(
      `${brand ? `${brand.toUpperCase()} ` : ''}laptop charger cable`,
      `${brand ? `${brand.toUpperCase()} ` : ''}charging cable`,
      'laptop charger cable',
      'USB-C laptop charger cable',
      'USB charging cable',
      'power adapter cable'
    );
  }

  if (hasPc || hasLaptop) {
    push(
      `${brand ? `${brand.toUpperCase()} ` : ''}laptop charger`,
      `${brand ? `${brand.toUpperCase()} ` : ''}charging cable`,
      'laptop power adapter',
      'laptop charger cable'
    );
  }

  if (hasPhone) {
    push(
      `${brand ? `${brand.toUpperCase()} ` : ''}phone charger`,
      'phone charging cable',
      'USB-C charging cable',
      'phone power adapter'
    );
  }

  if (brand && !hasCharger && !hasCable) {
    push(`${brand.toUpperCase()} accessory`, `${brand.toUpperCase()} product`);
  }

  push(query, buildSearchQuery(query));

  return Array.from(variants).slice(0, 8);
};

const extractOpenverseUrls = (results: any[]) => {
  return results
    .map((item: any) => item?.thumbnail || item?.url || item?.image_url || '')
    .filter(Boolean);
};

const searchOpenverseImages = async (queries: string[]) => {
  const links: string[] = [];

  for (const searchQuery of queries) {
    const response = await axios.get('https://api.openverse.org/v1/images/', {
      params: {
        q: searchQuery,
        page_size: 12
      },
      timeout: 7000
    });

    const results = Array.isArray(response.data?.results) ? response.data.results : [];
    links.push(...extractOpenverseUrls(results));

    if (links.length >= 6) {
      break;
    }
  }

  return uniqueUrls(links).slice(0, MAX_IMAGE_RESULTS);
};

const searchUnsplashImages = async (queries: string[], accessKey: string) => {
  const links: string[] = [];

  for (const searchQuery of queries) {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: searchQuery,
        per_page: 12,
        orientation: 'squarish',
        content_filter: 'high'
      },
      headers: {
        Authorization: `Client-ID ${accessKey}`
      },
      timeout: 7000
    });

    const results = Array.isArray(response.data?.results) ? response.data.results : [];
    const urls = results
      .map((item: any) => item?.urls?.regular || item?.urls?.small || item?.urls?.thumb || '')
      .filter(Boolean);

    links.push(...urls);

    if (links.length >= 6) {
      break;
    }
  }

  return uniqueUrls(links).slice(0, MAX_IMAGE_RESULTS);
};

export const searchProductImages = async (query: string) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error('Please enter an image search query.');
  }

  try {
    const queries = buildQueryVariants(trimmedQuery);
    const openverseLinks = await searchOpenverseImages(queries);
    if (openverseLinks.length > 0) {
      return openverseLinks;
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (accessKey) {
      const unsplashLinks = await searchUnsplashImages(queries, accessKey);
      if (unsplashLinks.length > 0) {
        return unsplashLinks;
      }
    }

    throw new Error(`No image results found for: ${queries.join(', ')}`);
  } catch (error) {
    const summary = getAxiosErrorSummary(error);
    console.warn(`Product image search failed: ${summary}`);
    throw new Error(`Image search failed: ${summary}`);
  }
};
