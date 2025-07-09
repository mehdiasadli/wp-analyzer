import { Stats, type RankingConfig, type StatsConfig } from './stats';
import { getData } from './data';
import { DEFAULT_ACTIVITY_REPORT_CONFIG } from './constants';

// Helper function to validate date format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
}

// Helper function to parse command line arguments
function parseArgs(): { startDate?: string; endDate?: string } {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return {};
  } else if (args.length === 1) {
    const startDate = args[0];
    if (!startDate || !isValidDate(startDate)) {
      throw new Error(`Invalid start date format: ${startDate}. Use YYYY-MM-DD format.`);
    }
    return { startDate };
  } else if (args.length === 2) {
    const [startDate, endDate] = args;

    // Handle 'null' as first argument (only end date)
    if (startDate === 'null') {
      if (!endDate || !isValidDate(endDate)) {
        throw new Error(`Invalid end date format: ${endDate}. Use YYYY-MM-DD format.`);
      }
      return { endDate };
    }

    // Both dates provided
    if (!startDate || !isValidDate(startDate)) {
      throw new Error(`Invalid start date format: ${startDate}. Use YYYY-MM-DD format.`);
    }
    if (!endDate || !isValidDate(endDate)) {
      throw new Error(`Invalid end date format: ${endDate}. Use YYYY-MM-DD format.`);
    }
    return { startDate, endDate };
  } else {
    throw new Error('Too many arguments. Usage: npm run stats [startDate] [endDate] or npm run stats null [endDate]');
  }
}

async function stat() {
  try {
    const args = parseArgs();
    const messages = await getData('08-07-25');
    const stats = new Stats(messages);

    // Determine config based on arguments
    let reportConfig: StatsConfig = { timePeriod: 'total' };
    let rankingsConfig: RankingConfig = { timePeriod: 'total', rankingType: 'message_count' };

    if (args.startDate && args.endDate) {
      // Both dates provided - custom period
      reportConfig = {
        timePeriod: 'custom',
        customStartDate: new Date(args.startDate),
        customEndDate: new Date(args.endDate),
      };
      rankingsConfig = {
        timePeriod: 'custom',
        customStartDate: new Date(args.startDate),
        customEndDate: new Date(args.endDate),
        rankingType: 'message_count',
      };
    } else if (args.startDate && !args.endDate) {
      // Only start date provided - end at today
      reportConfig = {
        timePeriod: 'custom',
        customStartDate: new Date(args.startDate),
        customEndDate: new Date(),
      };
      rankingsConfig = {
        timePeriod: 'custom',
        customStartDate: new Date(args.startDate),
        customEndDate: new Date(),
        rankingType: 'message_count',
      };
    } else if (args.endDate && !args.startDate) {
      // Only end date provided - start from first message
      const firstMessageDate = messages[0]?.timestamp;
      if (!firstMessageDate) {
        throw new Error('No messages found to determine start date.');
      }
      reportConfig = {
        timePeriod: 'custom',
        customStartDate: firstMessageDate,
        customEndDate: new Date(args.endDate),
      };
      rankingsConfig = {
        timePeriod: 'custom',
        customStartDate: firstMessageDate,
        customEndDate: new Date(args.endDate),
        rankingType: 'message_count',
      };
    }

    console.log(stats.report(reportConfig));
    console.log('\n' + '='.repeat(50) + '\n');
    console.log(stats.reportRankings(rankingsConfig));
    console.log('\n' + '='.repeat(50) + '\n');
    console.log(
      stats.reportCategories({
        ...DEFAULT_ACTIVITY_REPORT_CONFIG,
      })
    );
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

stat().catch(console.error);
