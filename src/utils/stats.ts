// Stats engine

import type { Message } from './data';
import { Filter, type FilterOperator } from './filtering';
import { calcPoints } from './calc-points';
import type { ContentType, MessageStatus } from './content-parser';

// Time period types
export type TimePeriod = 'total' | 'last_year' | 'last_month' | 'last_week' | 'last_day' | 'custom';

// Ranking types
export type RankingType = 'message_count' | 'message_points' | 'activity_score';

// Activity score calculation options
export type ActivityScoreConfig = {
  messageWeight: number;
  pointWeight: number;
  timeDecayFactor: number;
  uniqueDayBonus: number;
};

// Base configuration for time filtering
export type BaseConfig = {
  timePeriod: TimePeriod;
  customStartDate?: Date;
  customEndDate?: Date;
  activityScoreConfig?: ActivityScoreConfig;
  includeDeleted?: boolean;
  groupBy?: 'author' | 'type' | 'status' | 'hour' | 'day' | 'month';
};

// Stats configuration (for general stats operations)
export type StatsConfig = BaseConfig;

// Ranking configuration (extends base config with ranking-specific options)
export type RankingConfig = BaseConfig & {
  rankingType: RankingType;
  limit?: number;
};

// User statistics
export type UserStats = {
  author: string;
  messageCount: number;
  totalPoints: number;
  activityScore: number;
  averagePointsPerMessage: number;
  messageTypes: Record<ContentType, number>;
  statusCounts: Record<MessageStatus, number>;
  firstMessage: Date;
  lastMessage: Date;
  activeDays: number;
  averageMessagesPerDay: number;
  longestStreak: number;
  currentStreak: number;
  mostActiveHour: number;
  mostActiveDay: string;
  mostActiveDayByDate: string;
  mostActiveMonth: string;
  mostActiveYear: string;
  mostQuietHour: number;
  mostQuietDay: string;
  mostQuietDayByDate: string;
  mostQuietMonth: string;
  mostQuietYear: string;
  hourlyActivity: Record<number, number>;
  dailyActivity: Record<string, number>; // days of week
  dailyActivityByDate: Record<string, number>; // actual dates
  monthlyActivity: Record<string, number>;
  yearlyActivity: Record<string, number>;
  callStats: {
    total: number;
    voice: number;
    video: number;
    missed: number;
    totalDuration: number;
  };
  pollStats: {
    created: number;
    totalVotes: number;
  };
  contentStats: {
    totalCharacters: number;
    averageCharactersPerMessage: number;
    longestMessage: string;
    shortestMessage: string;
  };
};

// Overall statistics
export type OverallStats = {
  totalMessages: number;
  totalUsers: number;
  totalPoints: number;
  averagePointsPerMessage: number;
  dateRange: {
    start: Date;
    end: Date;
    duration: number; // in days
  };
  messageTypeDistribution: Record<ContentType, { count: number; percentage: number }>;
  statusDistribution: Record<MessageStatus, { count: number; percentage: number }>;
  hourlyActivity: Record<number, number>;
  dailyActivity: Record<string, number>; // days of week
  dailyActivityByDate: Record<string, number>; // actual dates
  monthlyActivity: Record<string, number>;
  yearlyActivity: Record<string, number>;
  callStats: {
    total: number;
    voice: number;
    video: number;
    missed: number;
    totalDuration: number;
    averageDuration: number;
  };
  pollStats: {
    total: number;
    totalVotes: number;
    averageVotesPerPoll: number;
  };
  contentStats: {
    totalCharacters: number;
    averageCharactersPerMessage: number;
    totalWords: number;
    averageWordsPerMessage: number;
  };
  funStats: {
    busiestHour: number;
    busiestDay: string;
    busiestDayByDate: string;
    busiestMonth: string;
    busiestYear: string;
    quietestHour: number;
    quietestDay: string;
    quietestDayByDate: string;
    quietestMonth: string;
    quietestYear: string;
    mostActiveUser: string;
    mostValuableUser: string;
    longestMessage: { author: string; content: string; length: number };
    shortestMessage: { author: string; content: string; length: number };
    messageStreak: { author: string; streak: number };
    callMaster: { author: string; calls: number };
    pollCreator: { author: string; polls: number };
  };
};

// Ranking entry
export type RankingEntry = {
  rank: number;
  author: string;
  value: number;
  percentage: number;
  change?: number; // compared to previous period
};

// Activity category result type
export type ActivityResult = {
  author: string;
  category: string;
  averageValue: number;
  weeklyBreakdown: {
    week1: { rank: number; value: number };
    week2: { rank: number; value: number };
    week3: { rank: number; value: number };
    week4: { rank: number; value: number };
  };
  weightedAverageRank: number;
};

// Cache key type for memoization
type CacheKey = string;

class Stats {
  private filter: Filter;
  private defaultActivityConfig: ActivityScoreConfig = {
    messageWeight: 0.4,
    pointWeight: 0.4,
    timeDecayFactor: 0.1,
    uniqueDayBonus: 0.2,
  };

  // Cache for memoized results
  private cache = new Map<CacheKey, unknown>();

  constructor(private readonly data: Message[]) {
    this.filter = new Filter(data);
  }

  // Helper method to generate cache keys
  private getCacheKey(method: string, config: Record<string, unknown>): CacheKey {
    return `${method}_${JSON.stringify(config)}`;
  }

  // Helper method to get cached result or compute and cache
  private getCachedOrCompute<T>(method: string, config: Record<string, unknown>, computeFn: () => T): T {
    const cacheKey = this.getCacheKey(method, config);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as T;
    }

    const result = computeFn();
    this.cache.set(cacheKey, result);
    return result;
  }

  // Clear cache when data changes
  public clearCache(): void {
    this.cache.clear();
  }

  // Get filtered data based on time period
  private getFilteredData(config: BaseConfig): Message[] {
    return this.getCachedOrCompute('getFilteredData', config, () => {
      const { timePeriod, customStartDate, customEndDate, includeDeleted = true } = config;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      switch (timePeriod) {
        case 'total':
          return includeDeleted ? this.data : this.filter.where({ message: { status: { neq: 'deleted' } } });

        case 'last_year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;

        case 'last_month':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;

        case 'last_week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;

        case 'last_day':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 1);
          break;

        case 'custom':
          startDate = customStartDate;
          endDate = customEndDate;
          break;
      }

      const filter: FilterOperator<Date> = {};
      if (startDate) {
        filter.gte = startDate;
      }
      if (endDate) {
        filter.lte = endDate;
      }

      const timeFilter = Object.keys(filter).length > 0 ? { timestamp: filter } : {};
      const statusFilter = includeDeleted ? {} : { message: { status: { neq: 'deleted' as MessageStatus } } };

      return this.filter.where({ ...timeFilter, ...statusFilter });
    });
  }

  // Calculate activity score for a user
  private calculateActivityScore(messages: Message[], config: ActivityScoreConfig): number {
    if (messages.length === 0) return 0;

    const totalPoints = messages.reduce((sum, msg) => sum + calcPoints(msg), 0);
    const messageScore = messages.length * config.messageWeight;
    const pointScore = totalPoints * config.pointWeight;

    // Time decay factor (recent messages are worth more)
    const now = new Date();
    const timeDecayScore = messages.reduce((sum, msg) => {
      const daysDiff = (now.getTime() - msg.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return sum + Math.exp(-config.timeDecayFactor * daysDiff);
    }, 0);

    // Unique days bonus
    const uniqueDays = new Set(messages.map((msg) => msg.timestamp.toDateString())).size;
    const dayBonus = uniqueDays * config.uniqueDayBonus;

    return messageScore + pointScore + timeDecayScore + dayBonus;
  }

  // Get user statistics
  getUserStats(author: string, config: StatsConfig = { timePeriod: 'total' }): UserStats {
    const filteredData = this.getFilteredData(config);
    const userMessages = filteredData.filter((msg) => msg.author === author);

    if (userMessages.length === 0) {
      throw new Error(`No messages found for user: ${author}`);
    }

    const messageTypes: Record<ContentType, number> = {
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
      document: 0,
      sticker: 0,
      contact: 0,
      gif: 0,
      call: 0,
      poll: 0,
      'video note': 0,
    };

    const statusCounts: Record<MessageStatus, number> = {
      active: 0,
      edited: 0,
      deleted: 0,
    };

    let totalPoints = 0;
    let totalCharacters = 0;
    let longestMessage = '';
    let shortestMessage = '';
    const callStats = { total: 0, voice: 0, video: 0, missed: 0, totalDuration: 0 };
    const pollStats = { created: 0, totalVotes: 0 };

    userMessages.forEach((msg) => {
      const points = calcPoints(msg);
      totalPoints += points;

      messageTypes[msg.message.type]++;
      statusCounts[msg.message.status]++;

      if (msg.message.content) {
        const content = msg.message.content;
        totalCharacters += content.length;

        if (content.length > longestMessage.length) longestMessage = content;
        if (shortestMessage === '' || content.length < shortestMessage.length) shortestMessage = content;
      }

      if (msg.message.type === 'call' && msg.message.call) {
        callStats.total++;
        callStats.voice += msg.message.call.type === 'voice' ? 1 : 0;
        callStats.video += msg.message.call.type === 'video' ? 1 : 0;
        callStats.missed += msg.message.call.missed ? 1 : 0;
        callStats.totalDuration += msg.message.call.duration || 0;
      }

      if (msg.message.type === 'poll' && msg.message.poll) {
        pollStats.created++;
        pollStats.totalVotes += msg.message.poll.options.reduce((sum, opt) => sum + opt.votes, 0);
      }
    });

    const sortedMessages = userMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstMessage = sortedMessages[0]?.timestamp;
    const lastMessage = sortedMessages[sortedMessages.length - 1]?.timestamp;

    if (!firstMessage || !lastMessage) {
      throw new Error('No valid messages found for user');
    }

    const activeDays = new Set(userMessages.map((msg) => msg.timestamp.toDateString())).size;
    const duration = (lastMessage.getTime() - firstMessage.getTime()) / (1000 * 60 * 60 * 24);
    const averageMessagesPerDay = duration > 0 ? userMessages.length / duration : userMessages.length;

    // Calculate streaks
    const { longestStreak, currentStreak } = this.calculateStreaks(userMessages);

    // Most active hour and day
    const hourlyActivity: Record<number, number> = {};
    const dailyActivity: Record<string, number> = {};

    userMessages.forEach((msg) => {
      const hour = msg.timestamp.getHours();
      const day = msg.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    const mostActiveHour =
      Object.entries(hourlyActivity).reduce((a, b) => {
        const h1 = hourlyActivity[Number(a[0])] || 0;
        const h2 = hourlyActivity[Number(b[0])] || 0;

        return h1 > h2 ? a : b;
      })[0] || '0';

    const mostQuietHour =
      Object.entries(hourlyActivity).reduce((a, b) => {
        const h1 = hourlyActivity[Number(a[0])] || 0;
        const h2 = hourlyActivity[Number(b[0])] || 0;
        return h1 < h2 ? a : b;
      })[0] || '0';

    const mostActiveDay =
      Object.entries(dailyActivity).reduce((a, b) => {
        const d1 = dailyActivity[a[0]] || 0;
        const d2 = dailyActivity[b[0]] || 0;
        return d1 > d2 ? a : b;
      })[0] || 'Monday';

    const mostQuietDay =
      Object.entries(dailyActivity).reduce((a, b) => {
        const d1 = dailyActivity[a[0]] || 0;
        const d2 = dailyActivity[b[0]] || 0;
        return d1 < d2 ? a : b;
      })[0] || 'Monday';

    // Daily activity by date
    const dailyActivityByDate: Record<string, number> = {};
    userMessages.forEach((msg) => {
      const dayDate = msg.timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      dailyActivityByDate[dayDate] = (dailyActivityByDate[dayDate] || 0) + 1;
    });

    // Monthly activity
    const monthlyActivity: Record<string, number> = {};
    userMessages.forEach((msg) => {
      const month = msg.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
    });

    // Yearly activity
    const yearlyActivity: Record<string, number> = {};
    userMessages.forEach((msg) => {
      const year = msg.timestamp.toLocaleDateString('en-US', { year: 'numeric' });
      yearlyActivity[year] = (yearlyActivity[year] || 0) + 1;
    });

    // Calculate busiest and quietest for day by date, month, and year
    const mostActiveDayByDate =
      Object.entries(dailyActivityByDate).reduce((a, b) => {
        const d1 = dailyActivityByDate[a[0]] || 0;
        const d2 = dailyActivityByDate[b[0]] || 0;
        return d1 > d2 ? a : b;
      })[0] || '';

    const mostQuietDayByDate =
      Object.entries(dailyActivityByDate).reduce((a, b) => {
        const d1 = dailyActivityByDate[a[0]] || 0;
        const d2 = dailyActivityByDate[b[0]] || 0;
        return d1 < d2 ? a : b;
      })[0] || '';

    const mostActiveMonth =
      Object.entries(monthlyActivity).reduce((a, b) => {
        const m1 = monthlyActivity[a[0]] || 0;
        const m2 = monthlyActivity[b[0]] || 0;
        return m1 > m2 ? a : b;
      })[0] || '';

    const mostQuietMonth =
      Object.entries(monthlyActivity).reduce((a, b) => {
        const m1 = monthlyActivity[a[0]] || 0;
        const m2 = monthlyActivity[b[0]] || 0;
        return m1 < m2 ? a : b;
      })[0] || '';

    const mostActiveYear =
      Object.entries(yearlyActivity).reduce((a, b) => {
        const y1 = yearlyActivity[a[0]] || 0;
        const y2 = yearlyActivity[b[0]] || 0;
        return y1 > y2 ? a : b;
      })[0] || '';

    const mostQuietYear =
      Object.entries(yearlyActivity).reduce((a, b) => {
        const y1 = yearlyActivity[a[0]] || 0;
        const y2 = yearlyActivity[b[0]] || 0;
        return y1 < y2 ? a : b;
      })[0] || '';

    const activityConfig = config.activityScoreConfig || this.defaultActivityConfig;
    const activityScore = this.calculateActivityScore(userMessages, activityConfig);

    return {
      author,
      messageCount: userMessages.length,
      totalPoints,
      activityScore,
      averagePointsPerMessage: totalPoints / userMessages.length,
      messageTypes,
      statusCounts,
      firstMessage,
      lastMessage,
      activeDays,
      averageMessagesPerDay,
      longestStreak,
      currentStreak,
      mostActiveHour: parseInt(mostActiveHour),
      mostActiveDay,
      mostActiveDayByDate,
      mostActiveMonth,
      mostActiveYear,
      mostQuietHour: parseInt(mostQuietHour),
      mostQuietDay,
      mostQuietDayByDate,
      mostQuietMonth,
      mostQuietYear,
      hourlyActivity,
      dailyActivity,
      dailyActivityByDate,
      monthlyActivity,
      yearlyActivity,
      callStats,
      pollStats,
      contentStats: {
        totalCharacters,
        averageCharactersPerMessage: totalCharacters / userMessages.length,
        longestMessage,
        shortestMessage,
      },
    };
  }

  // Calculate message streaks
  private calculateStreaks(messages: Message[]): { longestStreak: number; currentStreak: number } {
    if (messages.length === 0) return { longestStreak: 0, currentStreak: 0 };

    const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const dates = sortedMessages.map((msg) => msg.timestamp.toDateString());
    const uniqueDates = [...new Set(dates)].sort();

    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDateStr = uniqueDates[i - 1];
      const currDateStr = uniqueDates[i];
      if (prevDateStr && currDateStr) {
        const prevDate = new Date(prevDateStr);
        const currDate = new Date(currDateStr);
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak
    const today = new Date().toDateString();
    const lastMessageDate = uniqueDates[uniqueDates.length - 1];
    if (lastMessageDate) {
      const lastMessageDateObj = new Date(lastMessageDate);
      const todayObj = new Date(today);
      const daysSinceLastMessage = (todayObj.getTime() - lastMessageDateObj.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastMessage <= 1) {
        // Count backwards from the last message
        let streak = 1;
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const currDateStr = uniqueDates[i];
          const nextDateStr = uniqueDates[i + 1];
          if (currDateStr && nextDateStr) {
            const currDate = new Date(currDateStr);
            const nextDate = new Date(nextDateStr);
            const dayDiff = (nextDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

            if (dayDiff === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
        currentStreak = streak;
      }
    }

    return { longestStreak, currentStreak };
  }

  // Get rankings
  getRankings(config: RankingConfig = { timePeriod: 'total', rankingType: 'message_count' }): RankingEntry[] {
    return this.getCachedOrCompute('getRankings', config, () => {
      const filteredData = this.getFilteredData(config);
      const users = [...new Set(filteredData.map((msg) => msg.author))];

      const rankings = users.map((author) => {
        const userStats = this.getUserStats(author, config);
        let value: number;

        switch (config.rankingType) {
          case 'message_count':
            value = userStats.messageCount;
            break;
          case 'message_points':
            value = userStats.totalPoints;
            break;
          case 'activity_score':
            value = userStats.activityScore;
            break;
          default:
            value = userStats.messageCount;
        }

        return { author, value };
      });

      // Sort by value descending
      rankings.sort((a, b) => b.value - a.value);

      const total = rankings.reduce((sum, r) => sum + r.value, 0);

      return rankings
        .map((ranking, index) => ({
          rank: index + 1,
          author: ranking.author,
          value: ranking.value,
          percentage: total > 0 ? (ranking.value / total) * 100 : 0,
        }))
        .slice(0, config.limit);
    });
  }

  // Get overall statistics
  getOverallStats(config: StatsConfig = { timePeriod: 'total' }): OverallStats {
    return this.getCachedOrCompute('getOverallStats', config, () => {
      const filteredData = this.getFilteredData(config);

      if (filteredData.length === 0) {
        throw new Error('No data available for the specified time period');
      }

      const users = [...new Set(filteredData.map((msg) => msg.author))];
      const totalPoints = filteredData.reduce((sum, msg) => sum + calcPoints(msg), 0);

      // Message type and status distribution
      const messageTypeCounts: Record<ContentType, number> = {
        text: 0,
        image: 0,
        video: 0,
        audio: 0,
        document: 0,
        sticker: 0,
        contact: 0,
        gif: 0,
        call: 0,
        poll: 0,
        'video note': 0,
      };

      const statusCounts: Record<MessageStatus, number> = {
        active: 0,
        edited: 0,
        deleted: 0,
      };

      // Activity patterns
      const hourlyActivity: Record<number, number> = {};
      const dailyActivity: Record<string, number> = {};
      const dailyActivityByDate: Record<string, number> = {};
      const monthlyActivity: Record<string, number> = {};
      const yearlyActivity: Record<string, number> = {};

      // Call and poll stats
      const callStats = { total: 0, voice: 0, video: 0, missed: 0, totalDuration: 0 };
      const pollStats = { total: 0, totalVotes: 0 };

      // Content stats
      let totalCharacters = 0;
      let totalWords = 0;
      let longestMessage = { author: '', content: '', length: 0 };

      // Process messages in batches for better performance
      const BATCH_SIZE = 1000;
      for (let i = 0; i < filteredData.length; i += BATCH_SIZE) {
        const batch = filteredData.slice(i, i + BATCH_SIZE);

        batch.forEach((msg) => {
          messageTypeCounts[msg.message.type]++;
          statusCounts[msg.message.status]++;

          const hour = msg.timestamp.getHours();
          const day = msg.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
          const dayDate = msg.timestamp.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          });
          const month = msg.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
          const year = msg.timestamp.toLocaleDateString('en-US', { year: 'numeric' });

          hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
          dailyActivity[day] = (dailyActivity[day] || 0) + 1;
          dailyActivityByDate[dayDate] = (dailyActivityByDate[dayDate] || 0) + 1;
          monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
          yearlyActivity[year] = (yearlyActivity[year] || 0) + 1;

          if (msg.message.type === 'call' && msg.message.call) {
            callStats.total++;
            callStats.voice += msg.message.call.type === 'voice' ? 1 : 0;
            callStats.video += msg.message.call.type === 'video' ? 1 : 0;
            callStats.missed += msg.message.call.missed ? 1 : 0;
            callStats.totalDuration += msg.message.call.duration || 0;
          }

          if (msg.message.type === 'poll' && msg.message.poll) {
            pollStats.total++;
            pollStats.totalVotes += msg.message.poll.options.reduce((sum, opt) => sum + opt.votes, 0);
          }

          if (msg.message.content) {
            const content = msg.message.content;
            totalCharacters += content.length;
            totalWords += content.split(/\s+/).length;

            if (content.length > longestMessage.length) {
              longestMessage = { author: msg.author, content, length: content.length };
            }
          }
        });

        // Allow other tasks to run between batches
        if (i + BATCH_SIZE < filteredData.length) {
          // Small delay to prevent blocking
          const delay = Math.min(1, filteredData.length / 10000);
          if (delay > 0) {
            const start = Date.now();
            while (Date.now() - start < delay) {
              // Busy wait for small delay
            }
          }
        }
      }

      // Debug logs for activity maps
      // Remove or comment out after verifying
      // console.log('dailyActivityByDate', dailyActivityByDate);
      // console.log('monthlyActivity', monthlyActivity);
      // console.log('yearlyActivity', yearlyActivity);

      // Calculate distributions
      const messageTypeDistribution = Object.entries(messageTypeCounts).reduce(
        (acc, [type, count]) => {
          acc[type as ContentType] = { count, percentage: (count / filteredData.length) * 100 };
          return acc;
        },
        {} as Record<ContentType, { count: number; percentage: number }>
      );

      const statusDistribution = Object.entries(statusCounts).reduce(
        (acc, [status, count]) => {
          acc[status as MessageStatus] = { count, percentage: (count / filteredData.length) * 100 };
          return acc;
        },
        {} as Record<MessageStatus, { count: number; percentage: number }>
      );

      // Date range
      const sortedData = filteredData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const startDate = sortedData[0]?.timestamp;
      const endDate = sortedData[sortedData.length - 1]?.timestamp;

      if (!startDate || !endDate) {
        throw new Error('No valid messages found for date range calculation');
      }

      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      // Fun stats
      const busiestHour =
        Object.entries(hourlyActivity).reduce((a, b) => {
          const h1 = hourlyActivity[Number(a[0])] || 0;
          const h2 = hourlyActivity[Number(b[0])] || 0;
          return h1 > h2 ? a : b;
        })[0] || '0';
      const busiestDay =
        Object.entries(dailyActivity).reduce((a, b) => {
          const d1 = dailyActivity[a[0]] || 0;
          const d2 = dailyActivity[b[0]] || 0;
          return d1 > d2 ? a : b;
        })[0] || 'Monday';
      const quietestHour =
        Object.entries(hourlyActivity).reduce((a, b) => {
          const h1 = hourlyActivity[Number(a[0])] || 0;
          const h2 = hourlyActivity[Number(b[0])] || 0;
          return h1 < h2 ? a : b;
        })[0] || '0';
      const quietestDay =
        Object.entries(dailyActivity).reduce((a, b) => {
          const d1 = dailyActivity[a[0]] || 0;
          const d2 = dailyActivity[b[0]] || 0;
          return d1 < d2 ? a : b;
        })[0] || 'Sunday';

      // Calculate busiest and quietest for day by date, month, and year
      const busiestDayByDate =
        Object.entries(dailyActivityByDate).reduce((a, b) => {
          const d1 = dailyActivityByDate[a[0]] || 0;
          const d2 = dailyActivityByDate[b[0]] || 0;
          return d1 > d2 ? a : b;
        })[0] || '';

      const quietestDayByDate =
        Object.entries(dailyActivityByDate).reduce((a, b) => {
          const d1 = dailyActivityByDate[a[0]] || 0;
          const d2 = dailyActivityByDate[b[0]] || 0;
          return d1 < d2 ? a : b;
        })[0] || '';

      const busiestMonth =
        Object.entries(monthlyActivity).reduce((a, b) => {
          const m1 = monthlyActivity[a[0]] || 0;
          const m2 = monthlyActivity[b[0]] || 0;
          return m1 > m2 ? a : b;
        })[0] || '';

      const quietestMonth =
        Object.entries(monthlyActivity).reduce((a, b) => {
          const m1 = monthlyActivity[a[0]] || 0;
          const m2 = monthlyActivity[b[0]] || 0;
          return m1 < m2 ? a : b;
        })[0] || '';

      const busiestYear =
        Object.entries(yearlyActivity).reduce((a, b) => {
          const y1 = yearlyActivity[a[0]] || 0;
          const y2 = yearlyActivity[b[0]] || 0;
          return y1 > y2 ? a : b;
        })[0] || '';

      const quietestYear =
        Object.entries(yearlyActivity).reduce((a, b) => {
          const y1 = yearlyActivity[a[0]] || 0;
          const y2 = yearlyActivity[b[0]] || 0;
          return y1 < y2 ? a : b;
        })[0] || '';

      const rankings = this.getRankings({ ...config, rankingType: 'message_count' });
      const mostActiveUser = rankings[0]?.author || '';
      const mostValuableUser = this.getRankings({ ...config, rankingType: 'message_points' })[0]?.author || '';

      // Find shortest message
      const textMessages = filteredData.filter((msg) => msg.message.type === 'text' && msg.message.content);
      const shortestMessage = textMessages.reduce(
        (shortest, msg) => {
          const content = msg.message.content!;
          return content.length < shortest.length ? { author: msg.author, content, length: content.length } : shortest;
        },
        { author: '', content: '', length: Infinity }
      );

      // Message streak
      const userStreaks = users.map((author) => {
        const userStats = this.getUserStats(author, config);
        return { author, streak: userStats.longestStreak };
      });
      const messageStreak = userStreaks.reduce((max, user) => (user.streak > max.streak ? user : max));

      // Call master
      const callMasters = users.map((author) => {
        const userStats = this.getUserStats(author, config);
        return { author, calls: userStats.callStats.total };
      });
      const callMaster = callMasters.reduce((max, user) => (user.calls > max.calls ? user : max));

      // Poll creator
      const pollCreators = users.map((author) => {
        const userStats = this.getUserStats(author, config);
        return { author, polls: userStats.pollStats.created };
      });
      const pollCreator = pollCreators.reduce((max, user) => (user.polls > max.polls ? user : max));

      return {
        totalMessages: filteredData.length,
        totalUsers: users.length,
        totalPoints,
        averagePointsPerMessage: totalPoints / filteredData.length,
        dateRange: { start: startDate, end: endDate, duration },
        messageTypeDistribution,
        statusDistribution,
        hourlyActivity,
        dailyActivity,
        dailyActivityByDate,
        monthlyActivity,
        yearlyActivity,
        callStats: {
          ...callStats,
          averageDuration: callStats.total > 0 ? callStats.totalDuration / callStats.total : 0,
        },
        pollStats: {
          ...pollStats,
          averageVotesPerPoll: pollStats.total > 0 ? pollStats.totalVotes / pollStats.total : 0,
        },
        contentStats: {
          totalCharacters,
          averageCharactersPerMessage: totalCharacters / filteredData.length,
          totalWords,
          averageWordsPerMessage: totalWords / filteredData.length,
        },
        funStats: {
          busiestHour: parseInt(busiestHour),
          busiestDay,
          busiestDayByDate,
          busiestMonth,
          busiestYear,
          quietestHour: parseInt(quietestHour),
          quietestDay,
          quietestDayByDate,
          quietestMonth,
          quietestYear,
          mostActiveUser,
          mostValuableUser,
          longestMessage,
          shortestMessage:
            shortestMessage.length !== Infinity ? shortestMessage : { author: '', content: '', length: 0 },
          messageStreak,
          callMaster,
          pollCreator,
        },
      };
    });
  }

  // Get comparative stats between two periods
  getComparativeStats(
    period1: RankingConfig,
    period2: RankingConfig
  ): {
    period1: OverallStats;
    period2: OverallStats;
    changes: {
      messageCountChange: number;
      userCountChange: number;
      pointChange: number;
      topUserChange: { author: string; change: number };
    };
  } {
    const stats1 = this.getOverallStats(period1);
    const stats2 = this.getOverallStats(period2);

    const messageCountChange = ((stats2.totalMessages - stats1.totalMessages) / stats1.totalMessages) * 100;
    const userCountChange = ((stats2.totalUsers - stats1.totalUsers) / stats1.totalUsers) * 100;
    const pointChange = ((stats2.totalPoints - stats1.totalPoints) / stats1.totalPoints) * 100;

    // Find top user change
    const rankings1 = this.getRankings(period1);
    const rankings2 = this.getRankings(period2);
    const topUser1 = rankings1[0]!;
    const topUser2 = rankings2[0]!;

    const topUserChange = {
      author: topUser2.author,
      change: topUser1.author === topUser2.author ? ((topUser2.value - topUser1.value) / topUser1.value) * 100 : 0,
    };

    return {
      period1: stats1,
      period2: stats2,
      changes: {
        messageCountChange,
        userCountChange,
        pointChange,
        topUserChange,
      },
    };
  }

  // Generate activity heatmap data
  getActivityHeatmap(config: StatsConfig = { timePeriod: 'total' }): {
    hourly: Record<number, number>;
    daily: Record<string, number>;
    dailyByDate: Record<string, number>;
    monthly: Record<string, number>;
    yearly: Record<string, number>;
    combined: Record<string, number>; // "day-hour" format
  } {
    const filteredData = this.getFilteredData(config);

    const hourly: Record<number, number> = {};
    const daily: Record<string, number> = {};
    const dailyByDate: Record<string, number> = {};
    const monthly: Record<string, number> = {};
    const yearly: Record<string, number> = {};
    const combined: Record<string, number> = {};

    filteredData.forEach((msg) => {
      const hour = msg.timestamp.getHours();
      const day = msg.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      const dayDate = msg.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
      const month = msg.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const year = msg.timestamp.toLocaleDateString('en-US', { year: 'numeric' });
      const dayHour = `${day}-${hour}`;

      hourly[hour] = (hourly[hour] || 0) + 1;
      daily[day] = (daily[day] || 0) + 1;
      dailyByDate[dayDate] = (dailyByDate[dayDate] || 0) + 1;
      monthly[month] = (monthly[month] || 0) + 1;
      yearly[year] = (yearly[year] || 0) + 1;
      combined[dayHour] = (combined[dayHour] || 0) + 1;
    });

    return { hourly, daily, dailyByDate, monthly, yearly, combined };
  }

  // Get trending topics (most common words in text messages)
  getTrendingTopics(
    config: StatsConfig = { timePeriod: 'total' },
    limit: number = 10
  ): Array<{ word: string; count: number; percentage: number }> {
    const filteredData = this.getFilteredData(config);
    const textMessages = filteredData.filter(
      (msg) => msg.message.type === 'text' && msg.message.content && msg.message.status !== 'deleted'
    );

    const wordCounts: Record<string, number> = {};
    const totalWords = textMessages.reduce((sum, msg) => {
      const words = msg.message
        .content!.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 2); // Filter out short words

      words.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });

      return sum + words.length;
    }, 0);

    return Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / totalWords) * 100,
      }));
  }

  /**
   * Categorize users into activity levels based on their weighted average value over the last 4 weeks.
   * Recent weeks are weighted more heavily than older weeks.
   * Categories are assigned by value thresholds, not rank.
   * @param rankingType The ranking type to use (message_count, message_points, activity_score)
   * @param thresholds Optional: override default thresholds for any rankingType. Format: { activity_score: [super, active, moderate, not], ... }
   * @returns Array of ActivityResult objects
   */
  checkActivity(
    rankingType: RankingType = 'message_count',
    thresholds?: Partial<Record<RankingType, number[]>>
  ): ActivityResult[] {
    // Default thresholds for each metric: [Super, Active, Moderate, Not]
    const defaultThresholds: Record<RankingType, number[]> = {
      activity_score: [50, 30, 15, 5],
      message_count: [35, 20, 10, 3],
      message_points: [60, 35, 18, 6],
    };
    const usedThresholds = thresholds?.[rankingType] || defaultThresholds[rankingType];

    // 1. Get all unique users ever
    const allUsers = Array.from(new Set(this.data.map((msg) => msg.author)));
    if (allUsers.length === 0) return [];

    // 2. Get the last 4 weeks' date ranges
    const now = new Date();
    const weekRanges: { start: Date; end: Date }[] = [];
    for (let i = 0; i < 4; i++) {
      const end = new Date(now);
      end.setDate(now.getDate() - 7 * i);
      const start = new Date(end);
      start.setDate(end.getDate() - 6); // 7 days per week
      weekRanges.unshift({ start, end }); // oldest week first
    }

    // 3. Weights for each week (most recent week has highest weight)
    const weights = [1, 2, 3, 4]; // Week 1 (oldest) = 1, Week 4 (newest) = 4

    // 4. For each user, get their weekly data
    const userResults: ActivityResult[] = [];
    for (const user of allUsers) {
      const weeklyData = {
        week1: { rank: 0, value: 0 },
        week2: { rank: 0, value: 0 },
        week3: { rank: 0, value: 0 },
        week4: { rank: 0, value: 0 },
      };

      let totalValue = 0;
      let hasAnyActivity = false;

      for (let weekIndex = 0; weekIndex < weekRanges.length; weekIndex++) {
        const weekRange = weekRanges[weekIndex];
        if (!weekRange) continue;

        const { start, end } = weekRange;
        const weekKey = `week${weekIndex + 1}` as keyof typeof weeklyData;

        // Get rankings for this week
        const rankings = this.getRankings({
          timePeriod: 'custom',
          customStartDate: start,
          customEndDate: end,
          rankingType,
        });

        // Find this user's data for this week
        const entry = rankings.find((r) => r.author === user);
        if (entry && entry.value > 0) {
          weeklyData[weekKey] = { rank: entry.rank, value: entry.value };
          totalValue += entry.value;
          hasAnyActivity = true;
        }
      }

      // 5. Calculate weighted average value (not rank)
      let weightedValueSum = 0;
      let validWeeks = 0;
      for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
        const weekKey = `week${weekIndex + 1}` as keyof typeof weeklyData;
        const weekData = weeklyData[weekKey];
        const weight = weights[weekIndex];
        if (weekData && weekData.value > 0 && weight !== undefined) {
          weightedValueSum += weekData.value * weight;
          validWeeks += weight;
        }
      }
      const weightedAverageValue = validWeeks > 0 ? weightedValueSum / validWeeks : 0;
      const averageValue = hasAnyActivity ? totalValue / 4 : 0;

      userResults.push({
        author: user,
        category: '', // Will be assigned later
        averageValue,
        weeklyBreakdown: weeklyData,
        weightedAverageRank: weightedAverageValue, // For compatibility, but now it's value
      });
    }

    // 6. Sort by weighted average value (descending, higher is better)
    userResults.sort((a, b) => b.weightedAverageRank - a.weightedAverageRank);

    // 7. Assign categories by value thresholds
    for (const result of userResults) {
      const v = result.weightedAverageRank;
      if (v >= usedThresholds[0]!) result.category = 'Super Active';
      else if (v >= usedThresholds[1]!) result.category = 'Active';
      else if (v >= usedThresholds[2]!) result.category = 'Moderate';
      else if (v >= usedThresholds[3]!) result.category = 'Not Active';
      else result.category = 'Red Zone';
    }

    return userResults;
  }

  /**
   * Generate a formatted report string from overall statistics
   * @param config Configuration for the stats calculation
   * @returns Formatted report string
   */
  report(config: StatsConfig = { timePeriod: 'total' }): string {
    const stats = this.getOverallStats(config);

    // Helper function to format numbers with dots for thousands
    const formatNumber = (num: number): string => {
      return num.toLocaleString('de-DE'); // German locale uses dots for thousands
    };

    // Helper function to format time ranges
    const formatTimeRange = (hour: number): string => {
      const start = hour.toString().padStart(2, '0');
      const end = ((hour + 1) % 24).toString().padStart(2, '0');
      return `${start}:00-${end}:00`;
    };

    // Helper function to format date
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    };

    // Get top 5 active months
    const sortedMonths = Object.entries(stats.monthlyActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Sort message types by count (descending)
    const sortedMessageTypes = Object.entries(stats.messageTypeDistribution).sort(([, a], [, b]) => b.count - a.count);

    // Sort status distribution
    const sortedStatus = Object.entries(stats.statusDistribution).sort(([, a], [, b]) => b.count - a.count);

    // Sort daily activity
    const sortedDailyActivity = Object.entries(stats.dailyActivity).sort(([, a], [, b]) => b - a);

    let report = '*=== OVERALL STATISTICS ===*\n\n';

    // Basic stats with date range
    report += `*Date range:* ${formatDate(stats.dateRange.start)} - ${formatDate(stats.dateRange.end)}\n`;
    report += `*Total messages:* ${formatNumber(stats.totalMessages)}\n`;
    report += `*Total duration:* ${Math.round(stats.dateRange.duration)} days\n\n`;

    // Message Type Distribution
    report += '*== Message Type Distribution ==*\n';
    sortedMessageTypes.forEach(([type, data], index) => {
      const displayName =
        type === 'video note'
          ? 'Video note'
          : type === 'contact'
            ? 'Contact share'
            : type.charAt(0).toUpperCase() + type.slice(1);
      report += `${index + 1}. ${displayName}: ${formatNumber(data.count)}\n`;
    });
    report += '\n';

    // Status Distribution
    report += '*== Status Distribution ==*\n';
    sortedStatus.forEach(([status, data], index) => {
      const displayName =
        status === 'active' ? 'Not edited/Not deleted' : status.charAt(0).toUpperCase() + status.slice(1);
      report += `${index + 1}. ${displayName}: ${formatNumber(data.count)}\n`;
    });
    report += '\n';

    // Hourly Activity
    report += '*== Hourly Activity ==*\n';
    for (let hour = 0; hour < 24; hour++) {
      const count = stats.hourlyActivity[hour] || 0;
      report += `- ${formatTimeRange(hour)} > ${formatNumber(count)}\n`;
    }
    report += '\n';

    // Daily Activity (Days of Week)
    report += '*== Daily Activity (Days of Week) ==*\n';
    sortedDailyActivity.forEach(([day, count]) => {
      report += `- ${day} > ${formatNumber(count)}\n`;
    });
    report += '\n';

    // Top 5 Active Months
    report += '*== Top 5 Active Months ==*\n';
    sortedMonths.forEach(([month, count], index) => {
      report += `${index + 1}. ${month} > ${formatNumber(count)}\n`;
    });
    report += '\n';

    // Yearly Activity
    const sortedYears = Object.entries(stats.yearlyActivity).sort(([, a], [, b]) => b - a);
    report += '*== Yearly Activity ==*\n';
    sortedYears.forEach(([year, count]) => {
      report += `- ${year} > ${formatNumber(count)}\n`;
    });
    report += '\n';

    // Call Statistics
    report += '*== Call Statistics ==*\n';
    report += `*Total calls:* ${stats.callStats.total}\n`;
    report += `*Voice/Video calls:* ${stats.callStats.voice}/${stats.callStats.video}\n`;
    report += `*Missed calls:* ${stats.callStats.missed}\n`;
    report += `*Total duration:* ${formatNumber(stats.callStats.totalDuration)} seconds\n\n`;

    // Poll Statistics
    report += '*== Poll Statistics ==*\n';
    report += `*Total polls:* ${stats.pollStats.total}\n`;
    report += `*Total votes:* ${formatNumber(stats.pollStats.totalVotes)}\n\n`;

    // Content Statistics
    report += '*== Content Statistics ==*\n';
    report += `*Total characters:* ${formatNumber(stats.contentStats.totalCharacters)}\n`;
    report += `*Average characters per message:* ${stats.contentStats.averageCharactersPerMessage}\n`;
    report += `*Total words:* ${formatNumber(stats.contentStats.totalWords)}\n\n`;

    // Other Statistics
    report += '*== Other Statistics ==*\n';
    report += `*Busiest hour:* ${formatTimeRange(stats.funStats.busiestHour)}\n`;
    report += `*Busiest day:* ${stats.funStats.busiestDay}\n`;
    report += `*Quietest hour:* ${formatTimeRange(stats.funStats.quietestHour)}\n`;
    report += `*Quietest day:* ${stats.funStats.quietestDay}\n`;
    report += `*Most active user:* ${stats.funStats.mostActiveUser}\n`;
    report += `*Most valuable user:* ${stats.funStats.mostValuableUser}\n`;
    report += `*Longest message:* by ${stats.funStats.longestMessage.author}, ${formatNumber(stats.funStats.longestMessage.length)} characters\n`;
    report += `*Most calls:* by ${stats.funStats.callMaster.author}, ${stats.funStats.callMaster.calls} calls\n`;
    report += `*Most polls:* by ${stats.funStats.pollCreator.author}, ${stats.funStats.pollCreator.polls} polls\n`;

    return report;
  }

  /**
   * Generate a formatted rankings report string
   * @param config Configuration for the rankings calculation
   * @returns Formatted rankings report string
   */
  reportRankings(config: RankingConfig = { timePeriod: 'total', rankingType: 'message_count' }): string {
    const rankings = this.getRankings(config);

    // Helper function to format numbers with dots for thousands
    const formatNumber = (num: number): string => {
      return num.toLocaleString('de-DE'); // German locale uses dots for thousands
    };

    // Helper function to format date
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    };

    // Helper function to get date range description
    const getDateRangeDescription = (config: RankingConfig): string => {
      const { timePeriod, customStartDate, customEndDate } = config;

      if (timePeriod === 'custom' && customStartDate && customEndDate) {
        return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
      }

      // For non-custom periods, get the actual date range from the data
      const filteredData = this.getFilteredData(config);
      if (filteredData.length === 0) {
        return 'No data available';
      }

      const startDate = filteredData[0]?.timestamp;
      const endDate = filteredData[filteredData.length - 1]?.timestamp;

      if (startDate && endDate) {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }

      return 'Date range unavailable';
    };

    // Helper function to get ranking type display name
    const getRankingTypeDisplay = (type: RankingType): string => {
      switch (type) {
        case 'message_count':
          return 'MOST MESSAGES';
        case 'message_points':
          return 'MOST POINTS';
        case 'activity_score':
          return 'HIGHEST ACTIVITY SCORE';
        default:
          return 'MOST MESSAGES';
      }
    };

    const dateRangeDesc = getDateRangeDescription(config);
    const rankingTypeDesc = getRankingTypeDisplay(config.rankingType);
    const limit = config.limit || 10;

    let report = `=== TOP ${limit} USERS WITH ${rankingTypeDesc} ===\n`;
    report += `_Date range: ${dateRangeDesc}_\n\n`;

    rankings.slice(0, limit).forEach((entry, index) => {
      const rank = index + 1;
      const formattedValue = formatNumber(entry.value);
      report += `${rank}. ${entry.author} - ${formattedValue}\n`;
    });

    return report;
  }

  /**
   * Generate a formatted activity category report string
   * @param config Optional: { rankingType, thresholds } for checkActivity
   * @returns Formatted activity category report string
   */
  reportCategories(config?: {
    rankingType?: RankingType;
    thresholds?: Partial<Record<RankingType, number[]>>;
    removeUsers?: string[];
    mapUserNames?: Record<string, string>;
  }): string {
    const today = new Date();
    const formatDate = (date: Date): string =>
      date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // Get activity results
    let results = this.checkActivity(config?.rankingType || 'message_count', config?.thresholds);

    // Filter out users if specified
    if (config?.removeUsers) {
      results = results.filter((r) => !config?.removeUsers?.includes(r.author));
    }

    if (config?.mapUserNames) {
      results = results.map((r) => ({
        ...r,
        author: config?.mapUserNames?.[r.author] || r.author,
      }));
    }

    // Group users by category
    const categories = ['Super Active', 'Active', 'Moderate', 'Not Active', 'Red Zone'];
    const grouped: Record<string, string[]> = {};
    for (const cat of categories) grouped[cat] = [];
    for (const r of results) {
      const cat = categories.includes(r.category) ? r.category : 'Red Zone';
      (grouped[cat] as string[]).push(r.author);
    }

    // Build report
    let report = '*=== Activity Report ===*\n';
    report += `_Date: ${formatDate(today)}_\n\n`;
    for (const cat of categories) {
      report += `*${cat}:*\n`;
      const users = grouped[cat] ?? [];
      if (users.length > 0) {
        report += users.join(', ') + '\n\n';
      } else {
        report += '-- No users --\n\n';
      }
    }
    report += '_Note: Users on the "Red Zone" must be aware the risk of getting out of the group_';
    return report;
  }
}

export { Stats };
