import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Stats } from '../utils/stats';
import { DEFAULT_ACTIVITY_REPORT_CONFIG } from '../utils/constants';
import type { OverallStats } from '../utils/stats';
import { useFilteredMessages } from './useFilteredMessages';

interface StatsData {
  overallReport: string;
  rankingsReport: string;
  categoriesReport: string;
  overallStats: OverallStats;
}

interface UseStatsReturn {
  statsData: StatsData | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => void;
}

// Debounce function to prevent excessive computations
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useStats(): UseStatsReturn {
  const filteredMessages = useFilteredMessages();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce filtered messages to prevent excessive recalculations
  const debouncedMessages = useDebounce(filteredMessages, 300);

  // Cache for stats instance
  const statsInstanceRef = useRef<Stats | null>(null);
  const lastMessagesRef = useRef<typeof filteredMessages>(null);

  // Memoize the Stats instance to prevent recreation on every render
  const statsInstance = useMemo(() => {
    if (!debouncedMessages || debouncedMessages.length === 0) return null;

    // Only create new instance if messages actually changed
    if (lastMessagesRef.current !== debouncedMessages) {
      statsInstanceRef.current = new Stats(debouncedMessages);
      lastMessagesRef.current = debouncedMessages;
    }

    return statsInstanceRef.current;
  }, [debouncedMessages]);

  // Compute stats using main thread with optimizations
  const computeStats = useCallback(async () => {
    if (!debouncedMessages || debouncedMessages.length === 0) {
      setStatsData(null);
      setError(null);
      return;
    }

    if (!statsInstance) {
      setError('Failed to initialize statistics');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use requestIdleCallback for better performance on mobile
      const computeInIdle = () => {
        return new Promise<void>((resolve) => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              console.log(`Computing statistics for ${debouncedMessages.length.toLocaleString()} messages...`);
              resolve();
            });
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
              console.log(`Computing statistics for ${debouncedMessages.length.toLocaleString()} messages...`);
              resolve();
            }, 50);
          }
        });
      };

      await computeInIdle();

      const [overallReport, rankingsReport, categoriesReport, overallStats] = await Promise.all([
        // Run computations in parallel for better performance
        new Promise<string>((resolve) => {
          const result = statsInstance.report();
          resolve(result);
        }),
        new Promise<string>((resolve) => {
          const result = statsInstance.reportRankings();
          resolve(result);
        }),
        new Promise<string>((resolve) => {
          const result = statsInstance.reportCategories({
            ...DEFAULT_ACTIVITY_REPORT_CONFIG,
          });
          resolve(result);
        }),
        new Promise<OverallStats>((resolve) => {
          const result = statsInstance.getOverallStats();
          resolve(result);
        }),
      ]);

      setStatsData({
        overallReport,
        rankingsReport,
        categoriesReport,
        overallStats,
      });
    } catch (err) {
      console.error('Error computing stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to compute statistics');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedMessages, statsInstance]);

  // Refresh stats function
  const refreshStats = useCallback(() => {
    if (statsInstance) {
      statsInstance.clearCache();
    }
    computeStats();
  }, [statsInstance, computeStats]);

  // Compute stats when messages change
  useEffect(() => {
    computeStats();
  }, [computeStats]);

  return {
    statsData,
    isLoading,
    error,
    refreshStats,
  };
}
