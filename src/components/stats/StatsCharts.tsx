import { Card, Grid, Group, Title, Select, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconMessage, IconUser } from '@tabler/icons-react';
import { useMantineTheme } from '@mantine/core';
import { useState, useMemo } from 'react';
import type { OverallStats } from '../../utils/stats';
import { Stats } from '../../utils/stats';
import type { Message } from '../../utils/data';

interface StatsChartsProps {
  stats: OverallStats;
  messages: Message[]; // For getting user stats
}

export function StatsCharts({ stats, messages }: StatsChartsProps) {
  const theme = useMantineTheme();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Get unique users for the select dropdown
  const users = useMemo(() => {
    const uniqueUsers = new Set(messages.map((msg) => msg.author));
    return Array.from(uniqueUsers).sort();
  }, [messages]);

  // Get user stats if a user is selected
  const userStats = useMemo(() => {
    if (!selectedUser || messages.length === 0) return null;

    try {
      const statsInstance = new Stats(messages);
      return statsInstance.getUserStats(selectedUser);
    } catch {
      return null;
    }
  }, [selectedUser, messages]);

  // Use user stats if available, otherwise use overall stats
  const currentStats = userStats || stats;

  // Hourly distribution data
  const hourlyData = Object.entries(currentStats.hourlyActivity).map(([hour, count]) => ({
    hour: `${hour}:00`,
    messages: count,
  }));

  // Daily distribution data (days of week)
  const dailyData = Object.entries(currentStats.dailyActivity).map(([day, count]) => ({
    day,
    messages: count,
  }));

  // Daily activity by date data
  const dailyByDateData = Object.entries(currentStats.dailyActivityByDate || {})
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({
      date,
      messages: count,
    }));

  // Monthly distribution data
  const monthlyData = Object.entries(currentStats.monthlyActivity).map(([month, count]) => ({
    month,
    messages: count,
  }));

  // Yearly distribution data
  const yearlyData = Object.entries(currentStats.yearlyActivity || {}).map(([year, count]) => ({
    year,
    messages: count,
  }));

  return (
    <Stack gap='lg'>
      {/* User Selection */}
      <Card shadow='sm' padding='md' radius='md' withBorder>
        <Group justify='space-between' align='center'>
          <Group gap='xs'>
            <IconUser size={20} color={theme.colors.blue?.[6] || '#228be6'} />
            <Title order={4}>User Selection</Title>
          </Group>
          <Select
            placeholder='Select a user to view their stats'
            data={users.map((user) => ({ value: user, label: user }))}
            value={selectedUser}
            onChange={setSelectedUser}
            clearable
            style={{ minWidth: 200 }}
          />
        </Group>
        {selectedUser && (
          <Text size='sm' c='dimmed' mt='xs'>
            Showing stats for: <strong>{selectedUser}</strong>
          </Text>
        )}
      </Card>

      <Grid>
        {/* Hourly Distribution Line Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='md'>
              <Title order={3}>Hourly Activity</Title>
              <IconMessage size={20} color={theme.colors.orange?.[6] || '#fd7e14'} />
            </Group>
            <LineChart
              h={300}
              data={hourlyData}
              dataKey='hour'
              series={[{ name: 'messages', color: theme.colors.orange?.[6] || '#fd7e14' }]}
              tickLine='y'
            />
          </Card>
        </Grid.Col>

        {/* Daily Distribution Line Chart (Days of Week) */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='md'>
              <Title order={3}>Daily Activity (Week)</Title>
              <IconMessage size={20} color={theme.colors.violet?.[6] || '#845ef7'} />
            </Group>
            <LineChart
              h={300}
              data={dailyData}
              dataKey='day'
              series={[{ name: 'messages', color: theme.colors.violet?.[6] || '#845ef7' }]}
              tickLine='y'
            />
          </Card>
        </Grid.Col>

        {/* Daily Activity by Date Line Chart */}
        <Grid.Col span={{ base: 12 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='md'>
              <Title order={3}>Daily Activity (By Date)</Title>
              <IconMessage size={20} color={theme.colors.green?.[6] || '#40c057'} />
            </Group>
            <LineChart
              h={300}
              data={dailyByDateData}
              dataKey='date'
              series={[{ name: 'messages', color: theme.colors.green?.[6] || '#40c057' }]}
              tickLine='y'
            />
          </Card>
        </Grid.Col>

        {/* Monthly Distribution Line Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='md'>
              <Title order={3}>Monthly Activity</Title>
              <IconMessage size={20} color={theme.colors.teal?.[6] || '#20c997'} />
            </Group>
            <LineChart
              h={300}
              data={monthlyData}
              dataKey='month'
              series={[{ name: 'messages', color: theme.colors.teal?.[6] || '#20c997' }]}
              tickLine='y'
            />
          </Card>
        </Grid.Col>

        {/* Yearly Distribution Line Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='md'>
              <Title order={3}>Yearly Activity</Title>
              <IconMessage size={20} color={theme.colors.red?.[6] || '#fa5252'} />
            </Group>
            <LineChart
              h={300}
              data={yearlyData}
              dataKey='year'
              series={[{ name: 'messages', color: theme.colors.red?.[6] || '#fa5252' }]}
              tickLine='y'
            />
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
