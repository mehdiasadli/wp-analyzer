import { Card, Grid, Group, Title } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconMessage } from '@tabler/icons-react';
import { useMantineTheme } from '@mantine/core';
import type { OverallStats } from '../../utils/stats';

interface StatsChartsProps {
  stats: OverallStats;
}

export function StatsCharts({ stats }: StatsChartsProps) {
  const theme = useMantineTheme();

  // Hourly distribution data
  const hourlyData = Object.entries(stats.hourlyActivity).map(([hour, count]) => ({
    hour: `${hour}:00`,
    messages: count,
  }));

  // Daily distribution data
  const dailyData = Object.entries(stats.dailyActivity).map(([day, count]) => ({
    day,
    messages: count,
  }));

  // Monthly distribution data
  const monthlyData = Object.entries(stats.monthlyActivity).map(([month, count]) => ({
    month,
    messages: count,
  }));

  return (
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

      {/* Daily Distribution Line Chart */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card shadow='sm' padding='lg' radius='md' withBorder>
          <Group justify='space-between' mb='md'>
            <Title order={3}>Daily Activity</Title>
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
    </Grid>
  );
}
