import { useEffect, useState } from 'react';
import { sellerApi } from '@/services/api';

let cachedRate: number | null = null;
let pendingPromise: Promise<number> | null = null;

export function useExchangeRate() {
  const [usdToVnd, setUsdToVnd] = useState<number>(cachedRate ?? 25000);
  const [isLoading, setIsLoading] = useState<boolean>(cachedRate === null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cachedRate !== null) {
        setUsdToVnd(cachedRate);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (!pendingPromise) {
          pendingPromise = sellerApi.getExchangeRate().then((r) => r.usdToVnd);
        }
        const rate = await pendingPromise;
        cachedRate = rate;
        if (!cancelled) {
          setUsdToVnd(rate);
        }
      } catch {
        // keep default
      } finally {
        pendingPromise = null;
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { usdToVnd, isLoading };
}

