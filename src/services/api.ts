export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Client-side cache for read actions to avoid duplicate fetches and speed up navigation
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 1000; // 15 seconds

// Redirect all API calls directly to Next.js server database endpoint
export const fetchFromSheet = async <T>(action: string, payload: any = {}): Promise<T> => {
  const isRead = action.startsWith('get');
  const cacheKey = JSON.stringify({ action, payload });

  if (isRead) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  } else {
    // Clear cache on write/mutation actions to ensure fresh data
    apiCache.clear();
  }

  try {
    const response = await fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, payload }),
      cache: 'no-store'
    });
    
    const result: ApiResponse<T> = await response.json();
    if (!result.success) throw new Error(result.error);

    if (isRead) {
      apiCache.set(cacheKey, { data: result.data, timestamp: Date.now() });
    }

    return result.data as T;
  } catch (error) {
    console.error(`Error calling action ${action}:`, error);
    throw error;
  }
};
