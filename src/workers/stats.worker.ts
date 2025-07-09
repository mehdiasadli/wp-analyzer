// Web Worker for stats computation
// This runs in a separate thread to prevent UI blocking

import type { Message } from '../utils/data';

interface StatsWorkerMessage {
  type: 'compute';
  messages: Message[];
  config?: {
    timePeriod?: string;
    rankingType?: string;
    includeDeleted?: boolean;
  };
}

interface StatsWorkerResponse {
  type: 'result';
  data: {
    overallReport: string;
    rankingsReport: string;
    categoriesReport: string;
  };
}

interface StatsWorkerError {
  type: 'error';
  error: string;
}

// Simple stats computation functions for the worker
function computeBasicStats(messages: Message[]) {
  const totalMessages = messages.length;
  const users = [...new Set(messages.map((msg) => msg.author))];
  const totalUsers = users.length;

  // Message type distribution
  const messageTypes: Record<string, number> = {};
  messages.forEach((msg) => {
    const type = msg.message.type;
    messageTypes[type] = (messageTypes[type] || 0) + 1;
  });

  // Hourly activity
  const hourlyActivity: Record<number, number> = {};
  messages.forEach((msg) => {
    const hour = msg.timestamp.getHours();
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
  });

  // Daily activity
  const dailyActivity: Record<string, number> = {};
  messages.forEach((msg) => {
    const day = msg.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
    dailyActivity[day] = (dailyActivity[day] || 0) + 1;
  });

  // User rankings
  const userStats: Record<string, { messages: number; points: number }> = {};
  messages.forEach((msg) => {
    if (!userStats[msg.author]) {
      userStats[msg.author] = { messages: 0, points: 0 };
    }
    const userStat = userStats[msg.author]!;
    userStat.messages++;
    // Simple point calculation (you can enhance this)
    userStat.points += msg.message.content?.length || 0;
  });

  const rankings = Object.entries(userStats)
    .map(([author, stats]) => ({ author, ...stats }))
    .sort((a, b) => b.messages - a.messages);

  return {
    totalMessages,
    totalUsers,
    messageTypes,
    hourlyActivity,
    dailyActivity,
    rankings,
  };
}

function generateOverallReport(stats: ReturnType<typeof computeBasicStats>): string {
  let report = '*=== OVERALL STATISTICS ===*\n\n';

  report += `*Total messages:* ${stats.totalMessages.toLocaleString()}\n`;
  report += `*Total users:* ${stats.totalUsers}\n\n`;

  report += '*== Message Type Distribution ==*\n';
  Object.entries(stats.messageTypes)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count], index) => {
      const displayName = type.charAt(0).toUpperCase() + type.slice(1);
      report += `${index + 1}. ${displayName}: ${count.toLocaleString()}\n`;
    });
  report += '\n';

  report += '*== Hourly Activity ==*\n';
  for (let hour = 0; hour < 24; hour++) {
    const count = stats.hourlyActivity[hour] || 0;
    const start = hour.toString().padStart(2, '0');
    const end = ((hour + 1) % 24).toString().padStart(2, '0');
    report += `- ${start}:00-${end}:00 > ${count.toLocaleString()}\n`;
  }
  report += '\n';

  return report;
}

function generateRankingsReport(stats: ReturnType<typeof computeBasicStats>): string {
  let report = '=== TOP 10 USERS WITH MOST MESSAGES ===\n\n';

  stats.rankings.slice(0, 10).forEach((user, index) => {
    const rank = index + 1;
    report += `${rank}. ${user.author} - ${user.messages.toLocaleString()} messages\n`;
  });

  return report;
}

function generateCategoriesReport(stats: ReturnType<typeof computeBasicStats>): string {
  let report = '=== ACTIVITY CATEGORIES ===\n\n';

  const totalMessages = stats.totalMessages;
  const avgMessagesPerUser = totalMessages / stats.totalUsers;

  const categories = stats.rankings.map((user) => {
    const percentage = (user.messages / totalMessages) * 100;
    let category = 'Not Active';
    if (percentage > 10) category = 'Super Active';
    else if (percentage > 5) category = 'Active';
    else if (percentage > 2) category = 'Moderate';
    else if (user.messages > avgMessagesPerUser) category = 'Above Average';

    return { author: user.author, category, messages: user.messages, percentage };
  });

  const categoryGroups: Record<string, typeof categories> = {};
  categories.forEach((user) => {
    if (!categoryGroups[user.category]) {
      categoryGroups[user.category] = [];
    }
    const group = categoryGroups[user.category]!;
    group.push(user);
  });

  Object.entries(categoryGroups).forEach(([category, users]) => {
    report += `*${category}* (${users.length} users):\n`;
    users.forEach((user) => {
      report += `- ${user.author}: ${user.messages.toLocaleString()} messages (${user.percentage.toFixed(1)}%)\n`;
    });
    report += '\n';
  });

  return report;
}

// Worker message handler
self.onmessage = function (event: MessageEvent<StatsWorkerMessage>) {
  try {
    if (event.data.type === 'compute') {
      const { messages } = event.data;

      // Compute basic stats
      const stats = computeBasicStats(messages);

      // Generate reports
      const overallReport = generateOverallReport(stats);
      const rankingsReport = generateRankingsReport(stats);
      const categoriesReport = generateCategoriesReport(stats);

      const response: StatsWorkerResponse = {
        type: 'result',
        data: {
          overallReport,
          rankingsReport,
          categoriesReport,
        },
      };

      self.postMessage(response);
    }
  } catch (error) {
    const errorResponse: StatsWorkerError = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
    self.postMessage(errorResponse);
  }
};

export {};
