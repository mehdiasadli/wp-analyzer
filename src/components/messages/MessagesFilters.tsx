import {
  Paper,
  Stack,
  Group,
  TextInput,
  Select,
  ActionIcon,
  Text,
  Badge,
  Button,
  Collapse,
  Divider,
} from '@mantine/core';
import { IconSearch, IconRefresh, IconFilter, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { useState } from 'react';
import type { ContentType, MessageStatus } from '../../utils/content-parser';

export type SortField = 'timestamp' | 'author' | 'content';
export type SortDirection = 'asc' | 'desc';

interface MessagesFiltersProps {
  searchTerm: string;
  selectedAuthor: string;
  selectedType: ContentType | '';
  selectedStatus: MessageStatus | '';
  sortField: SortField;
  sortDirection: SortDirection;
  authors: string[];
  contentTypes: ContentType[];
  statuses: MessageStatus[];
  filteredCount: number;
  totalCount: number;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onClearFilters: () => void;
}

export function MessagesFilters({
  searchTerm,
  selectedAuthor,
  selectedType,
  selectedStatus,
  sortField,
  sortDirection,
  authors,
  contentTypes,
  statuses,
  filteredCount,
  totalCount,
  onFilterChange,
  onSortChange,
  onClearFilters,
}: MessagesFiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const sortOptions = [
    { value: 'timestamp', label: 'Timestamp' },
    { value: 'author', label: 'Author' },
    { value: 'content', label: 'Content Length' },
  ];

  const handleSortChange = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field as SortField, newDirection);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />;
  };

  return (
    <Paper p='lg' withBorder shadow='sm' radius='md'>
      <Stack gap='md'>
        {/* Header */}
        <Group justify='space-between' align='center'>
          <Group gap='xs'>
            <IconFilter size={20} />
            <Text fw={600} size='lg'>
              Filters & Sorting
            </Text>
            {(selectedAuthor || selectedType || selectedStatus || searchTerm) && (
              <Badge color='blue' variant='light'>
                Active
              </Badge>
            )}
          </Group>
          <Group gap='xs'>
            <Button
              variant='subtle'
              size='sm'
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              leftSection={<IconFilter size={16} />}
            >
              {filtersExpanded ? 'Hide' : 'Show'} Filters
            </Button>
            <ActionIcon onClick={onClearFilters} variant='outline' size='sm' color='red' title='Clear all filters'>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Results Summary */}
        {filteredCount !== totalCount && (
          <Text size='sm' c='dimmed'>
            Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} messages
          </Text>
        )}

        <Collapse in={filtersExpanded}>
          <Stack gap='lg'>
            <Divider />

            {/* Search */}
            <div>
              <Text fw={500} size='sm' mb='xs'>
                Search
              </Text>
              <TextInput
                placeholder='Search messages, authors, or content...'
                value={searchTerm}
                onChange={(e) => onFilterChange('search', e.target.value)}
                leftSection={<IconSearch size={16} />}
                size='md'
                radius='md'
              />
            </div>

            {/* Filters Row */}
            <div>
              <Text fw={500} size='sm' mb='xs'>
                Filters
              </Text>
              <Group grow>
                <Select
                  placeholder='Filter by author'
                  value={selectedAuthor}
                  onChange={(value) => onFilterChange('author', value || '')}
                  data={authors.map((author) => ({ value: author, label: author }))}
                  clearable
                  size='md'
                  radius='md'
                />
                <Select
                  placeholder='Filter by type'
                  value={selectedType}
                  onChange={(value) => onFilterChange('type', value || '')}
                  data={contentTypes.map((type) => ({ value: type, label: type }))}
                  clearable
                  size='md'
                  radius='md'
                />
                <Select
                  placeholder='Filter by status'
                  value={selectedStatus}
                  onChange={(value) => onFilterChange('status', value || '')}
                  data={statuses.map((status) => ({ value: status, label: status }))}
                  clearable
                  size='md'
                  radius='md'
                />
              </Group>
            </div>

            {/* Sorting */}
            <div>
              <Text fw={500} size='sm' mb='xs'>
                Sorting
              </Text>
              <Group gap='xs'>
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={sortField === option.value ? 'filled' : 'outline'}
                    size='sm'
                    radius='md'
                    onClick={() => handleSortChange(option.value)}
                    leftSection={getSortIcon(option.value as SortField)}
                  >
                    {option.label}
                  </Button>
                ))}
              </Group>
            </div>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}
