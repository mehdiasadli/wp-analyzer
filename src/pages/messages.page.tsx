import { useState, useMemo, useCallback } from 'react';
import { Container, Stack, Title, Group, Button, Text, Alert } from '@mantine/core';
import { IconArrowLeft, IconDatabase } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useData } from '../stores/data.store';
import {
  MessagesFilters,
  MessagesTable,
  MessagesPagination,
  type SortField,
  type SortDirection,
} from '../components/messages';
import { DateFilter } from '../components/date-filter';
import { useFilteredMessages } from '../hooks/useFilteredMessages';
import type { ContentType, MessageStatus } from '../utils/content-parser';
import type { Message } from '../utils/data';

const ITEMS_PER_PAGE = 50;

export function MessagesPage() {
  const { messages } = useData();
  const filteredMessages = useFilteredMessages();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<MessageStatus | ''>('');

  // Sorting states
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  // Get unique values for filters
  const authors = useMemo(() => {
    const uniqueAuthors = new Set(filteredMessages.map((msg: Message) => msg.author));
    return Array.from(uniqueAuthors).sort();
  }, [filteredMessages]);

  const contentTypes = useMemo(() => {
    const uniqueTypes = new Set(filteredMessages.map((msg: Message) => msg.message.type));
    return Array.from(uniqueTypes).sort() as ContentType[];
  }, [filteredMessages]);

  const statuses = useMemo(() => {
    const uniqueStatuses = new Set(filteredMessages.map((msg: Message) => msg.message.status));
    return Array.from(uniqueStatuses).sort() as MessageStatus[];
  }, [filteredMessages]);

  // Filter and sort messages
  const filteredAndSortedMessages = useMemo(() => {
    const filtered = filteredMessages.filter((message: Message) => {
      const matchesSearch =
        !searchTerm ||
        message.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (message.message.content && message.message.content.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesAuthor = !selectedAuthor || message.author === selectedAuthor;
      const matchesType = !selectedType || message.message.type === selectedType;
      const matchesStatus = !selectedStatus || message.message.status === selectedStatus;

      return matchesSearch && matchesAuthor && matchesType && matchesStatus;
    });

    // Sort messages
    return [...filtered].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'content':
          // Sort by content length instead of alphabetical
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
  }, [filteredMessages, searchTerm, selectedAuthor, selectedType, selectedStatus, sortField, sortDirection]);

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
