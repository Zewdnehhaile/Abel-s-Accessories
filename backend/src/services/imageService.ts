import axios from 'axios';
import { AxiosResponse } from 'axios';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const uniqueUrls = (urls: string[]) => Array.from(new Set(urls.filter(Boolean)));
const GOOGLE_PAGE_STARTS = [1, 11, 21];
const MAX_IMAGE_RESULTS = 36;

const getAxiosErrorSummary = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (!axios.isAxiosError(error)) {
    return 'Unknown request error';
  }

  const status = error.response?.status;
  const apiMessage =
    (error.response?.data as any)?.error?.message ||
    error.message ||
    'Request failed';

  return status ? `${status} ${apiMessage}` : apiMessage;
};

const scoreImageMatch = (item: any, tokens: string[], fullQuery: string) => {
  const title = normalize(item?.title || '');
  const snippet = normalize(item?.snippet || '');
  const context = normalize(item?.image?.contextLink || '');
  const combined = `${title} ${snippet} ${context}`.trim();

  let score = 0;
  let tokenHits = 0;
  for (const token of tokens) {
    const hasTitle = title.includes(token);
    const hasSnippet = snippet.includes(token);
    const hasContext = context.includes(token);
    if (hasTitle || hasSnippet || hasContext) tokenHits += 1;
    if (hasTitle) score += 5;
    if (hasSnippet) score += 3;
    if (hasContext) score += 1;
  }
  if (fullQuery && title.includes(fullQuery)) score += 12;
  if (fullQuery && snippet.includes(fullQuery)) score += 8;
  if (fullQuery && combined.includes(fullQuery)) score += 10;
  if (tokens.length > 0 && tokenHits === tokens.length) score += 20;

  return { score, tokenHits };
};

export const searchProductImages = async (query: string) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error('Please enter an image search query.');
  }

  try {
    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCse = process.env.GOOGLE_CSE_ID;
    if (!googleKey || !googleCse) {
      throw new Error('Google image search is not configured.');
    }

    const normalizedQuery = normalize(trimmedQuery);
    const queryTokens = normalizedQuery.split(' ').filter(token => token.length > 1);

    try {
      const queryVariants = [
        `"${trimmedQuery}" product photo`,
        `"${trimmedQuery}" official image`,
        `"${trimmedQuery}" front back photo`
      ];

      const requests: Array<Promise<AxiosResponse<any>>> = queryVariants.flatMap(q =>
        GOOGLE_PAGE_STARTS.map(start =>
          axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
              key: googleKey,
              cx: googleCse,
              q,
              exactTerms: trimmedQuery,
              searchType: 'image',
              num: 10,
              start,
              safe: 'active',
              imgType: 'photo',
              imgSize: 'large'
            },
            timeout: 5000
          })
        )
      );

      const responses = await Promise.all(requests);

      const items = responses.flatMap(response =>
        Array.isArray(response.data?.items) ? response.data.items : []
      );

      const ranked = items
        .map((item: any) => {
          const match = scoreImageMatch(item, queryTokens, normalizedQuery);
          return {
            url: item.link || item.image?.thumbnailLink || '',
            score: match.score,
            tokenHits: match.tokenHits
          };
        })
        .filter((entry: { url: string }) => Boolean(entry.url))
        .sort((a, b) => {
          if (b.tokenHits !== a.tokenHits) return b.tokenHits - a.tokenHits;
          return b.score - a.score;
        });

      const strictMatches = ranked.filter(entry => queryTokens.length === 0 || entry.tokenHits >= queryTokens.length);
      const fallbackMatches = ranked.filter(entry => entry.score > 0);

      const links = uniqueUrls([
        ...strictMatches.map(entry => entry.url),
        ...fallbackMatches.map(entry => entry.url),
        ...ranked.map(entry => entry.url)
      ]).slice(0, MAX_IMAGE_RESULTS);

      if (links.length > 0) {
        return links;
      }

      throw new Error('Google image search returned no matching images.');
    } catch (googleError) {
      const summary = getAxiosErrorSummary(googleError);
      console.warn(`Google image search failed: ${summary}`);
      throw new Error(`Google image search failed: ${summary}`);
    }
  } catch (error) {
    throw new Error(getAxiosErrorSummary(error));
  }
};
