import { useState, useEffect, useMemo, useCallback } from 'react';
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

export function useStats(): UseStatsReturn {
  const filteredMessages = useFilteredMessages();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the Stats instance to prevent recreation on every render
  const statsInstance = useMemo(() => {
    if (!filteredMessages || filteredMessages.length === 0) return null;
    return new Stats(filteredMessages);
  }, [filteredMessages]);

  // Compute stats using main thread with optimizations
  const computeStats = useCallback(async () => {
    if (!filteredMessages || filteredMessages.length === 0) {
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
      // Use a small delay to allow UI to render first
      await new Promise((resolve) => setTimeout(resolve, 50));

      console.log(`Computing statistics for ${filteredMessages.length.toLocaleString()} messages...`);

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
  }, [filteredMessages, statsInstance]);

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
