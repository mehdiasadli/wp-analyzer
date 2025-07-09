import { Link } from 'react-router-dom';
import { useData } from '../stores/data.store';
import { Button, Container, Stack, Text, Loader, Group, ActionIcon, Alert, Tabs, Card } from '@mantine/core';
import { IconArrowLeft, IconDatabase, IconRefresh, IconChartBar, IconFileText, IconUser } from '@tabler/icons-react';
import { useStats } from '../hooks/useStats';
import { StatsOverview, ReportsSection, StatsCharts, UserStats } from '../components/stats';
import { DateFilter } from '../components/date-filter';
import { useFilteredMessages } from '../hooks/useFilteredMessages';

export function StatsPage() {
  const { messages } = useData();
  const filteredMessages = useFilteredMessages();
  const { statsData, isLoading, error, refreshStats } = useStats();

  if (messages.length === 0) {
    return (
      <Container size='lg' py='xl'>
        <Stack gap='lg'>
          <Group>
            <Link to='/'>
              <Button variant='subtle' leftSection={<IconArrowLeft size={16} />}>
                Back to Home
              </Button>
            </Link>
          </Group>

          <Alert icon={<IconDatabase size={16} />} title='No Messages Available' color='blue' variant='light'>
            No messages have been uploaded yet. Please upload a chat file from the home page to view messages.
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size='xl' py='xl'>
      <Stack gap='lg'>
        {/* Header */}
        <Group justify='space-between' align='center'>
          <Group gap='md'>
            <Link to='/'>
              <Button variant='subtle' leftSection={<IconArrowLeft size={16} />}>
                Back to Home
              </Button>
            </Link>
            <Text size='xl' fw={700}>
              Statistics Dashboard
            </Text>
            <Text size='sm' c='dimmed'>
              ({filteredMessages.length.toLocaleString()} of {messages.length.toLocaleString()} messages)
            </Text>
          </Group>

          <ActionIcon variant='outline' size='lg' onClick={refreshStats} loading={isLoading} title='Refresh statistics'>
            <IconRefresh size={20} />
          </ActionIcon>
        </Group>

        {/* Date Filter */}
        <DateFilter />

        {/* Loading State */}
        {isLoading && (
          <Card withBorder shadow='sm' radius='md' p='xl'>
            <Group justify='center' align='center'>
              <Loader size='lg' />
              <Text size='lg'>Computing statistics for {filteredMessages.length.toLocaleString()} messages...</Text>
            </Group>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card withBorder shadow='sm' radius='md' p='xl'>
            <Text ta='center' c='red'>
              {error}
            </Text>
          </Card>
        )}

        {/* Stats Content */}
        {statsData && !isLoading && (
          <Tabs defaultValue='stats' variant='pills' radius='md'>
            <Tabs.List>
              <Tabs.Tab value='stats' leftSection={<IconChartBar size={16} />} fw={600}>
                Statistics Overview
              </Tabs.Tab>
              <Tabs.Tab value='charts' leftSection={<IconChartBar size={16} />} fw={600}>
                Charts
              </Tabs.Tab>
              <Tabs.Tab value='reports' leftSection={<IconFileText size={16} />} fw={600}>
                Detailed Reports
              </Tabs.Tab>
              <Tabs.Tab value='userStats' leftSection={<IconUser size={16} />} fw={600}>
                User Statistics
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value='stats' pt='lg'>
              <StatsOverview stats={statsData.overallStats} />
            </Tabs.Panel>

            <Tabs.Panel value='charts' pt='lg'>
              <StatsCharts stats={statsData.overallStats} />
            </Tabs.Panel>

            <Tabs.Panel value='reports' pt='lg'>
              <ReportsSection
                overallReport={statsData.overallReport}
                rankingsReport={statsData.rankingsReport}
                categoriesReport={statsData.categoriesReport}
              />
            </Tabs.Panel>

            <Tabs.Panel value='userStats' pt='lg'>
              <UserStats messages={filteredMessages} />
            </Tabs.Panel>
          </Tabs>
        )}

        {/* No Data State */}
        {!statsData && !isLoading && !error && (
          <Card withBorder shadow='sm' radius='md' p='xl'>
            <Text ta='center' c='dimmed'>
              No statistics available
            </Text>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
