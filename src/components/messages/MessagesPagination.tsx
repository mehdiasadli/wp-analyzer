import { Group, Pagination, Text, Select, Paper, Stack } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface MessagesPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: string | null) => void;
}

const PAGE_SIZE_OPTIONS = [
  { value: '25', label: '25 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' },
  { value: '200', label: '200 per page' },
];

export function MessagesPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: MessagesPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Paper p='md' withBorder shadow='sm' radius='md'>
      <Stack gap='md'>
        {/* Page Info */}
        <Group justify='space-between' align='center'>
          <Text size='sm' c='dimmed'>
            Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} messages
          </Text>

          <Group gap='xs' align='center'>
            <Text size='sm' fw={500}>
              Items per page:
            </Text>
            <Select
              value={pageSize.toString()}
              onChange={onPageSizeChange}
              data={PAGE_SIZE_OPTIONS}
              size='sm'
              w={120}
              radius='md'
            />
          </Group>
        </Group>

        {/* Pagination */}
        <Group justify='center'>
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
            size='md'
            radius='md'
            withEdges
            siblings={1}
            boundaries={1}
            nextIcon={IconChevronRight}
            previousIcon={IconChevronLeft}
          />
        </Group>
      </Stack>
    </Paper>
  );
}
