import { useState, useMemo } from 'react';
import { Card, Grid, Group, Title, Text, Select, Stack, Badge, RingProgress } from '@mantine/core';
import { IconUser, IconMessage, IconPhone, IconCalendar, IconTrendingUp } from '@tabler/icons-react';
import { useMantineTheme } from '@mantine/core';
import type { UserStats } from '../../utils/stats';
import type { Message } from '../../utils/data';
import { Stats } from '../../utils/stats';

interface UserStatsProps {
  messages: Message[];
}

export function UserStats({ messages }: UserStatsProps) {
  const theme = useMantineTheme();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Get unique users from messages
  const users = useMemo(() => {
    const uniqueUsers = new Set(messages.map((msg) => msg.author).filter(Boolean));
    return Array.from(uniqueUsers).sort();
  }, [messages]);

  // Get user stats when a user is selected
  const userStats = useMemo(() => {
    if (!selectedUser || messages.length === 0) return null;

    const stats = new Stats(messages);
    return stats.getUserStats(selectedUser);
  }, [selectedUser, messages]);

  // Calculate activity percentage
  const activityPercentage = useMemo(() => {
    if (!userStats || messages.length === 0) return 0;
    return Math.round((userStats.messageCount / messages.length) * 100);
  }, [userStats, messages.length]);

  if (users.length === 0) {
    return (
      <Card withBorder shadow='sm' radius='md' p='xl'>
        <Text ta='center' c='dimmed'>
          No users found in the messages
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap='lg'>
      {/* User Selection */}
      <Card withBorder shadow='sm' radius='md' p='lg'>
        <Group justify='space-between' mb='md'>
          <Title order={3}>Select User</Title>
          <IconUser size={20} color={theme.colors.blue?.[6] || '#228be6'} />
        </Group>
        <Select
          placeholder='Choose a user to view their statistics'
          data={users}
          value={selectedUser}
          onChange={setSelectedUser}
          searchable
          clearable
        />
      </Card>

      {/* User Statistics */}
      {userStats && (
        <Grid>
          {/* Basic Stats */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='space-between' mb='md'>
                <Title order={4}>Basic Statistics</Title>
                <IconMessage size={18} color={theme.colors.blue?.[6] || '#228be6'} />
              </Group>
              <Stack gap='sm'>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Total Messages
                  </Text>
                  <Badge variant='light' color='blue'>
                    {userStats.messageCount.toLocaleString()}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Activity Percentage
                  </Text>
                  <Badge variant='light' color='green'>
                    {activityPercentage}%
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Total Points
                  </Text>
                  <Badge variant='light' color='orange'>
                    {userStats.totalPoints.toLocaleString()}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Avg Points/Message
                  </Text>
                  <Badge variant='light' color='purple'>
                    {userStats.averagePointsPerMessage.toFixed(1)}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Activity Stats */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='space-between' mb='md'>
                <Title order={4}>Activity Statistics</Title>
                <IconTrendingUp size={18} color={theme.colors.green?.[6] || '#40c057'} />
              </Group>
              <Stack gap='sm'>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Active Days
                  </Text>
                  <Badge variant='light' color='green'>
                    {userStats.activeDays}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Avg Messages/Day
                  </Text>
                  <Badge variant='light' color='blue'>
                    {userStats.averageMessagesPerDay.toFixed(1)}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Longest Streak
                  </Text>
                  <Badge variant='light' color='orange'>
                    {userStats.longestStreak} days
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Current Streak
                  </Text>
                  <Badge variant='light' color='red'>
                    {userStats.currentStreak} days
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Message Types */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='space-between' mb='md'>
                <Title order={4}>Message Types</Title>
                <IconMessage size={18} color={theme.colors.violet?.[6] || '#845ef7'} />
              </Group>
              <Stack gap='sm'>
                {Object.entries(userStats.messageTypes).map(([type, count]) => (
                  <Group key={type} justify='space-between'>
                    <Text size='sm' c='dimmed' tt='capitalize'>
                      {type}
                    </Text>
                    <Badge variant='light' color='violet'>
                      {count.toLocaleString()}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Call Statistics */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='space-between' mb='md'>
                <Title order={4}>Call Statistics</Title>
                <IconPhone size={18} color={theme.colors.teal?.[6] || '#20c997'} />
              </Group>
              <Stack gap='sm'>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Total Calls
                  </Text>
                  <Badge variant='light' color='teal'>
                    {userStats.callStats.total}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Voice Calls
                  </Text>
                  <Badge variant='light' color='blue'>
                    {userStats.callStats.voice}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Video Calls
                  </Text>
                  <Badge variant='light' color='purple'>
                    {userStats.callStats.video}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Missed Calls
                  </Text>
                  <Badge variant='light' color='red'>
                    {userStats.callStats.missed}
                  </Badge>
                </Group>
                {userStats.callStats.totalDuration > 0 && (
                  <Group justify='space-between'>
                    <Text size='sm' c='dimmed'>
                      Total Duration
                    </Text>
                    <Badge variant='light' color='orange'>
                      {Math.round(userStats.callStats.totalDuration / 60)} min
                    </Badge>
                  </Group>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Activity Ring */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='center' mb='md'>
                <Title order={4}>Activity Level</Title>
              </Group>
              <Group justify='center'>
                <RingProgress
                  size={120}
                  thickness={12}
                  sections={[{ value: activityPercentage, color: theme.colors.blue?.[6] || '#228be6' }]}
                  label={
                    <Text ta='center' size='lg' fw={700}>
                      {activityPercentage}%
                    </Text>
                  }
                />
              </Group>
            </Card>
          </Grid.Col>

          {/* Time Period */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder shadow='sm' radius='md' p='lg'>
              <Group justify='space-between' mb='md'>
                <Title order={4}>Time Period</Title>
                <IconCalendar size={18} color={theme.colors.orange?.[6] || '#fd7e14'} />
              </Group>
              <Stack gap='sm'>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    First Message
                  </Text>
                  <Badge variant='light' color='green'>
                    {userStats.firstMessage.toLocaleDateString()}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Last Message
                  </Text>
                  <Badge variant='light' color='red'>
                    {userStats.lastMessage.toLocaleDateString()}
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Most Active Hour
                  </Text>
                  <Badge variant='light' color='blue'>
                    {userStats.mostActiveHour}:00
                  </Badge>
                </Group>
                <Group justify='space-between'>
                  <Text size='sm' c='dimmed'>
                    Most Active Day
                  </Text>
                  <Badge variant='light' color='purple'>
                    {userStats.mostActiveDay}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* No User Selected */}
      {!selectedUser && (
        <Card withBorder shadow='sm' radius='md' p='xl'>
          <Text ta='center' c='dimmed'>
            Select a user from the dropdown above to view their detailed statistics
          </Text>
        </Card>
      )}
    </Stack>
  );
}
