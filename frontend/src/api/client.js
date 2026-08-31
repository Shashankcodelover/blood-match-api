/**
 * LifeStream V4 - Zero-Crash Resilient API Client
 * Features automatic cold-start retries, timeout handling, and in-memory offline fallback.
 */

// In-memory fallback cache
const cacheStore = new Map();

export async function resilientFetch(url, options = {}, retries = 2, timeoutMs = 8000) {
  const cacheKey = `${options.method || 'GET'}:${url}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Cache successful GET responses
        if (!options.method || options.method === 'GET') {
          cacheStore.set(cacheKey, data);
          try {
            localStorage.setItem(`cache:${cacheKey}`, JSON.stringify(data));
          } catch (e) {}
        }
        return data;
      }
    } catch (err) {
      // If last attempt failed, check fallback cache
      if (attempt === retries) {
        console.warn(`[LifeStream Network] Endpoint ${url} delayed or unreachable. Utilizing cache fallback.`);

        if (cacheStore.has(cacheKey)) {
          return cacheStore.get(cacheKey);
        }

        try {
          const localSaved = localStorage.getItem(`cache:${cacheKey}`);
          if (localSaved) return JSON.parse(localSaved);
        } catch (e) {}

        // Graceful empty fallback based on endpoint type
        if (url.includes('/hospitals')) return [];
        if (url.includes('/matches')) return { hospital: {}, matches: [] };
        if (url.includes('/track-all')) return [];
        if (url.includes('/requests')) return [];
        if (url.includes('/leaderboard')) return [];

        throw err;
      }

      // Exponential backoff before retry (300ms, 800ms)
      await new Promise(res => setTimeout(res, 300 * Math.pow(2, attempt)));
    }
  }
}
