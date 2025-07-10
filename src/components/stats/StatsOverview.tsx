import { Grid, Card, Text, Group, Badge, Progress, Stack, Box, Paper, useMantineTheme } from '@mantine/core';
import {
  IconMessage,
  IconUsers,
  IconTrophy,
  IconClock,
  IconPhone,
  IconPill,
  IconTrendingUp,
  IconActivity,
} from '@tabler/icons-react';
import type { OverallStats } from '../../utils/stats';

interface StatsOverviewProps {
  stats: OverallStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const theme = useMantineTheme();

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  // Format duration in days
  const formatDuration = (days: number): string => {
    if (days < 1) return 'Less than a day';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  // Get most active hour display
  const getBusiestHourDisplay = (hour: number): string => {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <Stack gap='lg'>
      {/* Main Stats Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Group justify='space-between' mb='md'>
              <Box>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
                  Total Messages
                </Text>
                <Text size='xl' fw={700} c='blue'>
                  {formatNumber(stats.totalMessages)}
                </Text>
              </Box>
              <IconMessage size={32} color={theme.colors.blue[6]} />
            </Group>
            <Progress value={100} color='blue' size='sm' radius='xl' />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Group justify='space-between' mb='md'>
              <Box>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
                  Active Users
                </Text>
                <Text size='xl' fw={700} c='green'>
                  {formatNumber(stats.totalUsers)}
                </Text>
              </Box>
              <IconUsers size={32} color={theme.colors.green[6]} />
            </Group>
            <Progress value={100} color='green' size='sm' radius='xl' />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Group justify='space-between' mb='md'>
              <Box>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
                  Total Points
                </Text>
                <Text size='xl' fw={700} c='orange'>
                  {formatNumber(stats.totalPoints)}
                </Text>
              </Box>
              <IconTrophy size={32} color={theme.colors.orange[6]} />
            </Group>
            <Progress value={100} color='orange' size='sm' radius='xl' />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Group justify='space-between' mb='md'>
              <Box>
                <Text size='xs' c='dimmed' tt='uppercase' fw={600}>
                  Duration
                </Text>
                <Text size='xl' fw={700} c='purple'>
                  {formatDuration(+stats.dateRange.duration.toFixed(2))}
                </Text>
              </Box>
              <IconClock size={32} color={theme.colors.purple?.[6] || theme.colors.gray[6]} />
            </Group>
            <Progress value={100} color='purple' size='sm' radius='xl' />
          </Card>
        </Grid.Col>
      </Grid>

      {/* Activity Overview */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Group justify='space-between' mb='lg'>
              <Text fw={600} size='lg'>
                Activity Overview
              </Text>
              <IconActivity size={20} color={theme.colors.blue[6]} />
            </Group>

            <Stack gap='md'>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Busiest Hour
                </Text>
                <Badge color='blue' variant='light'>
                  {getBusiestHourDisplay(stats.funStats.busiestHour)}
                </Badge>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Quietest Hour
                </Text>
                <Badge color='red' variant='light'>
                  {getBusiestHourDisplay(stats.funStats.quietestHour)}
                </Badge>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Busiest Day
                </Text>
                <Badge color='green' variant='light'>
                  {stats.funStats.busiestDay}
                </Badge>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Quietest Day
                </Text>
                <Badge color='red' variant='light'>
                  {stats.funStats.quietestDay}
                </Badge>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Busiest Day (by Date)
                </Text>
                <Badge color='green' variant='light'>
                  {stats.funStats.busiestDayByDate}
                </Badge>
              </Group>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Quietest Day (by Date)
                </Text>
                <Badge color='red' variant='light'>
                  {stats.funStats.quietestDayByDate}
                </Badge>
              </Group>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Busiest Month
                </Text>
                <Badge color='green' variant='light'>
                  {stats.funStats.busiestMonth}
                </Badge>
              </Group>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Quietest Month
                </Text>
                <Badge color='red' variant='light'>
                  {stats.funStats.quietestMonth}
                </Badge>
              </Group>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Busiest Year
                </Text>
                <Badge color='green' variant='light'>
                  {stats.funStats.busiestYear}
                </Badge>
              </Group>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Quietest Year
                </Text>
                <Badge color='red' variant='light'>
                  {stats.funStats.quietestYear}
                </Badge>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack>
            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='space-between' mb='lg'>
                <Text fw={600} size='lg'>
                  Content Stats
                </Text>
                <IconTrendingUp size={20} color={theme.colors.green[6]} />
              </Group>

              <Stack gap='md'>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Total Characters
                  </Text>
                  <Text fw={600}>{formatNumber(stats.contentStats.totalCharacters)}</Text>
                </Group>

                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Avg Characters/Message
                  </Text>
                  <Text fw={600}>{Math.round(stats.contentStats.averageCharactersPerMessage)}</Text>
                </Group>

                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Total Words
                  </Text>
                  <Text fw={600}>{formatNumber(stats.contentStats.totalWords)}</Text>
                </Group>

                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Avg Words/Message
                  </Text>
                  <Text fw={600}>{Math.round(stats.contentStats.averageWordsPerMessage)}</Text>
                </Group>
              </Stack>
            </Card>

            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='space-between' mb='lg'>
                <Text fw={600} size='lg'>
                  User Activity Information
                </Text>
                <IconUsers size={20} color={theme.colors.blue[6]} />
              </Group>

              <Stack gap='md'>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Most Active User
                  </Text>
                  <Badge color='orange' variant='light'>
                    {stats.funStats.mostActiveUser}
                  </Badge>
                </Group>

                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Most Valuable User
                  </Text>
                  <Badge color='purple' variant='light'>
                    {stats.funStats.mostValuableUser}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Message Type Distribution */}
      <Card withBorder shadow='sm' radius='md' p='lg'>
        <Text fw={600} size='lg' mb='lg'>
          Message Type Distribution
        </Text>
        <Grid>
          {Object.entries(stats.messageTypeDistribution).map(([type, data]) => (
            <Grid.Col key={type} span={{ base: 6, sm: 4, md: 3 }}>
              <Paper p='md' withBorder radius='md'>
                <Stack gap='xs' align='center'>
                  <Text size='sm' fw={600} tt='capitalize'>
                    {type}
                  </Text>
                  <Text size='lg' fw={700} c='blue'>
                    {formatNumber(data.count)}
                  </Text>
                  <Text size='xs' c='dimmed'>
                    {formatPercentage(data.percentage)}
                  </Text>
                  <Progress value={data.percentage} color='blue' size='sm' w='100%' radius='xl' />
                </Stack>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Card>

      {/* Call & Poll Stats */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Group justify='space-between' mb='lg'>
              <Text fw={600} size='lg'>
                Call Statistics
              </Text>
              <IconPhone size={20} color={theme.colors.blue[6]} />
            </Group>

            <Stack gap='md'>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Total Calls
                </Text>
                <Text fw={600}>{formatNumber(stats.callStats.total)}</Text>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Voice Calls
                </Text>
                <Text fw={600}>{formatNumber(stats.callStats.voice)}</Text>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Video Calls
                </Text>
                <Text fw={600}>{formatNumber(stats.callStats.video)}</Text>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Missed Calls
                </Text>
                <Text fw={600} c='red'>
                  {formatNumber(stats.callStats.missed)}
                </Text>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Total Duration
                </Text>
                <Text fw={600}>{formatNumber(stats.callStats.totalDuration)}s</Text>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Avg Duration
                </Text>
                <Text fw={600}>{Math.round(stats.callStats.averageDuration)}s</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Group justify='space-between' mb='lg'>
              <Text fw={600} size='lg'>
                Poll Statistics
              </Text>
              <IconPill size={20} color={theme.colors.orange[6]} />
            </Group>

            <Stack gap='md'>
              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Total Polls
                </Text>
                <Text fw={600}>{formatNumber(stats.pollStats.total)}</Text>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Total Votes
                </Text>
                <Text fw={600}>{formatNumber(stats.pollStats.totalVotes)}</Text>
              </Group>

              <Group justify='space-between'>
                <Text size='sm' c='dimmed'>
                  Avg Votes/Poll
                </Text>
                <Text fw={600}>{Math.round(stats.pollStats.averageVotesPerPoll)}</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Fun Stats */}
      <Card withBorder shadow='sm' radius='md' p='lg'>
        <Text fw={600} size='lg' mb='lg'>
          Fun Statistics
        </Text>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p='md' withBorder radius='md' ta='center'>
              <Text size='sm' c='dimmed' mb='xs'>
                Longest Message
              </Text>
              <Text size='sm' fw={600} mb='xs'>
                {stats.funStats.longestMessage.author}
              </Text>
              <Text size='xs' c='dimmed' lineClamp={2}>
                {stats.funStats.longestMessage.content.substring(0, 50)}...
              </Text>
              <Badge color='blue' variant='light' mt='xs'>
                {formatNumber(stats.funStats.longestMessage.length)} chars
              </Badge>
            </Paper>
          </Grid.Col>

          {stats.funStats.pollCreator.polls > 0 && (
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p='md' withBorder radius='md' ta='center'>
                <Text size='sm' c='dimmed' mb='xs'>
                  Poll Master
                </Text>
                <Text size='sm' fw={600} mb='xs'>
                  {stats.funStats.pollCreator.author}
                </Text>
                <Text size='xs' c='dimmed' lineClamp={2}>
                  Most polls created
                </Text>
                <Badge color='green' variant='light' mt='xs'>
                  {formatNumber(stats.funStats.pollCreator.polls)} polls
                </Badge>
              </Paper>
            </Grid.Col>
          )}

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p='md' withBorder radius='md' ta='center'>
              <Text size='sm' c='dimmed' mb='xs'>
                Message Streak
              </Text>
              <Text size='sm' fw={600} mb='xs'>
                {stats.funStats.messageStreak.author}
              </Text>
              <Text size='xs' c='dimmed'>
                Longest consecutive days
              </Text>
              <Badge color='orange' variant='light' mt='xs'>
                {formatNumber(stats.funStats.messageStreak.streak)} days
              </Badge>
            </Paper>
          </Grid.Col>

          {stats.funStats.callMaster.calls > 0 && (
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p='md' withBorder radius='md' ta='center'>
                <Text size='sm' c='dimmed' mb='xs'>
                  Call Master
                </Text>
                <Text size='sm' fw={600} mb='xs'>
                  {stats.funStats.callMaster.author}
                </Text>
                <Text size='xs' c='dimmed'>
                  Most calls made
                </Text>
                <Badge color='purple' variant='light' mt='xs'>
                  {formatNumber(stats.funStats.callMaster.calls)} calls
                </Badge>
              </Paper>
            </Grid.Col>
          )}
        </Grid>
      </Card>
    </Stack>
  );
}
