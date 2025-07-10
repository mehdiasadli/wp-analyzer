import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Container, Stack, Title, Group, Button, Text, Alert } from '@mantine/core';
import { IconArrowLeft, IconDatabase } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useData } from '../stores/data.store';
import { useFilteredMessages } from '../hooks/useFilteredMessages';
import { DateFilter } from '../components/date-filter';
import { MessagesFilters } from '../components/messages/MessagesFilters';
import { MessagesTable } from '../components/messages/MessagesTable';
import { MessagesPagination } from '../components/messages/MessagesPagination';
import type { Message } from '../utils/data';
import type { ContentType, MessageStatus } from '../utils/content-parser';

// Debounce function for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ITEMS_PER_PAGE = 50;

type SortField = 'timestamp' | 'author' | 'content';
type SortDirection = 'asc' | 'desc';

export function MessagesPage() {
  const { messages } = useData();
  const filteredMessages = useFilteredMessages();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<MessageStatus | ''>('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  // Debounce search term to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Cache for unique values
  const uniqueValuesCache = useRef<{
    authors: string[];
    contentTypes: ContentType[];
    statuses: MessageStatus[];
  } | null>(null);

  // Get unique values for filters with caching
  const { authors, contentTypes, statuses } = useMemo(() => {
    // Check if we can use cached values
    if (uniqueValuesCache.current && uniqueValuesCache.current.authors.length > 0) {
      return uniqueValuesCache.current;
    }

    const uniqueAuthors = new Set(filteredMessages.map((msg: Message) => msg.author));
    const uniqueTypes = new Set(filteredMessages.map((msg: Message) => msg.message.type));
    const uniqueStatuses = new Set(filteredMessages.map((msg: Message) => msg.message.status));

    const result = {
      authors: Array.from(uniqueAuthors).sort(),
      contentTypes: Array.from(uniqueTypes).sort() as ContentType[],
      statuses: Array.from(uniqueStatuses).sort() as MessageStatus[],
    };

    // Cache the result
    uniqueValuesCache.current = result;
    return result;
  }, [filteredMessages]);

  // Filter and sort messages with optimizations
  const filteredAndSortedMessages = useMemo(() => {
    // Early return if no filters applied
    if (!debouncedSearchTerm && !selectedAuthor && !selectedType && !selectedStatus) {
      return filteredMessages;
    }

    const filtered = filteredMessages.filter((message: Message) => {
      // Optimize search by checking most common cases first
      if (selectedAuthor && message.author !== selectedAuthor) return false;
      if (selectedType && message.message.type !== selectedType) return false;
      if (selectedStatus && message.message.status !== selectedStatus) return false;

      // Search term check (most expensive, do last)
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const authorMatch = message.author.toLowerCase().includes(searchLower);
        const contentMatch = message.message.content && message.message.content.toLowerCase().includes(searchLower);

        if (!authorMatch && !contentMatch) return false;
      }

      return true;
    });

    // Sort messages
    return [...filtered].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'timestamp':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'content':
          aValue = (a.message.content || '').length;
          bValue = (b.message.content || '').length;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMessages, debouncedSearchTerm, selectedAuthor, selectedType, selectedStatus, sortField, sortDirection]);

  // Paginate messages
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedMessages.slice(startIndex, endIndex);
  }, [filteredAndSortedMessages, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedMessages.length / pageSize);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filters change

    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'author':
        setSelectedAuthor(value);
        break;
      case 'type':
        setSelectedType(value as ContentType);
        break;
      case 'status':
        setSelectedStatus(value as MessageStatus);
        break;
    }
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Handle page size changes
  const handlePageSizeChange = useCallback((newPageSize: string | null) => {
    if (newPageSize) {
      const size = parseInt(newPageSize);
      setPageSize(size);
      setCurrentPage(1); // Reset to first page
    }
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedAuthor('');
    setSelectedType('');
    setSelectedStatus('');
    setCurrentPage(1);
  }, []);

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
            <Title order={1}>Messages</Title>
            <Text size='lg' c='dimmed'>
              ({filteredMessages.length.toLocaleString()} of {messages.length.toLocaleString()} messages)
            </Text>
          </Group>

          <Link to='/stats'>
            <Button variant='outline' leftSection={<IconDatabase size={16} />}>
              View Stats
            </Button>
          </Link>
        </Group>

        {/* Date Filter */}
        <DateFilter />

        {/* Filters */}
        <MessagesFilters
          searchTerm={searchTerm}
          selectedAuthor={selectedAuthor}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          sortField={sortField}
          sortDirection={sortDirection}
          authors={authors}
          contentTypes={contentTypes}
          statuses={statuses}
          filteredCount={filteredAndSortedMessages.length}
          totalCount={filteredMessages.length}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
        />

        {/* Messages Table */}
        <MessagesTable messages={paginatedMessages} />

        {/* Pagination */}
        {totalPages > 1 && (
          <MessagesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSortedMessages.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </Stack>
    </Container>
  );
}
