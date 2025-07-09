import { useState } from 'react';
import { Group, Button, Text, Stack, Card, Title, ActionIcon, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconX, IconFilter } from '@tabler/icons-react';
import { useData } from '../stores/data.store';
import { useFilteredMessages } from '../hooks/useFilteredMessages';

export function DateFilter() {
  const { startDate, endDate, setStartDate, setEndDate, clearDateFilters, messages } = useData();
  const filteredMessages = useFilteredMessages();
  const [localStartDate, setLocalStartDate] = useState<Date | null>(startDate);
  const [localEndDate, setLocalEndDate] = useState<Date | null>(endDate);

  const handleApplyFilters = () => {
    setStartDate(localStartDate);
    setEndDate(localEndDate);
  };

  const handleClearFilters = () => {
    setLocalStartDate(null);
    setLocalEndDate(null);
    clearDateFilters();
  };

  const isFiltered = startDate || endDate;
  const filteredCount = filteredMessages.length;
  const totalCount = messages.length;

  // Get effective date range for display
  const getEffectiveDateRange = () => {
    if (messages.length === 0) return null;

    const firstMessageDate = new Date(Math.min(...messages.map((msg) => msg.timestamp.getTime())));
    const lastMessageDate = new Date(Math.max(...messages.map((msg) => msg.timestamp.getTime())));
    const today = new Date();

    const effectiveStart = startDate || firstMessageDate;
    const effectiveEnd = endDate || today;

    return { effectiveStart, effectiveEnd, firstMessageDate, lastMessageDate };
  };

  const dateRange = getEffectiveDateRange();

  return (
    <Card withBorder shadow='sm' radius='md' p='lg'>
      <Stack gap='md'>
        <Group justify='space-between' align='center'>
          <Group gap='sm'>
            <IconFilter size={20} color='var(--mantine-color-blue-6)' />
            <Title order={4}>Date Filter</Title>
          </Group>
          {isFiltered && (
            <Tooltip label='Clear filters'>
              <ActionIcon variant='light' color='red' size='sm' onClick={handleClearFilters}>
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        <Group gap='md' align='flex-end'>
          <DatePickerInput
            label='Start Date'
            placeholder='Select start date'
            value={localStartDate}
            onChange={(value) => setLocalStartDate(value ? new Date(value) : null)}
            clearable
            maxDate={localEndDate || undefined}
            leftSection={<IconCalendar size={16} />}
          />

          <DatePickerInput
            label='End Date'
            placeholder='Select end date'
            value={localEndDate}
            onChange={(value) => setLocalEndDate(value ? new Date(value) : null)}
            clearable
            minDate={localStartDate || undefined}
            leftSection={<IconCalendar size={16} />}
          />

          <Button onClick={handleApplyFilters} variant='light' color='blue'>
            Apply Filter
          </Button>
        </Group>

        {/* Filter Status */}
        {dateRange && (
          <Group gap='sm' c='dimmed'>
            <Text size='sm'>
              Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} messages
            </Text>
            <Text size='sm'>from {dateRange.effectiveStart.toLocaleDateString()}</Text>
            <Text size='sm'>to {dateRange.effectiveEnd.toLocaleDateString()}</Text>
            {!startDate && !endDate && (
              <Text size='sm' c='blue'>
                (using full date range)
              </Text>
            )}
          </Group>
        )}

        {/* Quick Presets */}
        <Group gap='sm'>
          <Text size='sm' fw={500}>
            Quick filters:
          </Text>
          <Button
            variant='subtle'
            size='xs'
            onClick={() => {
              const now = new Date();
              const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              setLocalStartDate(lastWeek);
              setLocalEndDate(now);
            }}
          >
            Last 7 days
          </Button>
          <Button
            variant='subtle'
            size='xs'
            onClick={() => {
              const now = new Date();
              const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              setLocalStartDate(lastMonth);
              setLocalEndDate(now);
            }}
          >
            Last 30 days
          </Button>
          <Button
            variant='subtle'
            size='xs'
            onClick={() => {
              const now = new Date();
              const startOfYear = new Date(now.getFullYear(), 0, 1);
              setLocalStartDate(startOfYear);
              setLocalEndDate(now);
            }}
          >
            This year
          </Button>
          <Button
            variant='subtle'
            size='xs'
            onClick={() => {
              if (dateRange) {
                setLocalStartDate(dateRange.firstMessageDate);
                setLocalEndDate(dateRange.lastMessageDate);
              }
            }}
          >
            Full range
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
