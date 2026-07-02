export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Redirect all API calls directly to Next.js server database endpoint
export const fetchFromSheet = async <T>(action: string, payload: any = {}): Promise<T> => {
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
    return result.data as T;
  } catch (error) {
    console.error(`Error calling action ${action}:`, error);
    throw error;
  }
};
