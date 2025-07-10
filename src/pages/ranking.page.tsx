import { useState, useMemo, useCallback } from 'react';
import { Container, Stack, Title, Group, Button, Text, Card, Grid, Badge } from '@mantine/core';
import { IconArrowLeft, IconTrophy, IconUsers, IconActivity } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useData } from '../stores/data.store';
import { useFilteredMessages } from '../hooks/useFilteredMessages';
import { DateFilter } from '../components/date-filter';
import { Stats } from '../utils/stats';
import type { RankingType } from '../utils/stats';
import { motion, AnimatePresence } from 'framer-motion';

const RANKING_TYPES: {
  value: RankingType;
  label: string;
  icon: React.ComponentType<{ size: number }>;
  color: string;
}[] = [
  { value: 'message_count', label: 'Message Count', icon: IconUsers, color: 'blue' },
  { value: 'message_points', label: 'Message Points', icon: IconTrophy, color: 'orange' },
  { value: 'activity_score', label: 'Activity Score', icon: IconActivity, color: 'green' },
];

const ITEMS_PER_PAGE = 10;

export function RankingPage() {
  const { messages } = useData();
  const filteredMessages = useFilteredMessages();
  const [selectedRankingType, setSelectedRankingType] = useState<RankingType>('message_count');
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize stats instance to prevent recreation
  const statsInstance = useMemo(() => {
    if (filteredMessages.length === 0) return null;
    return new Stats(filteredMessages);
  }, [filteredMessages]);

  // Calculate rankings with memoization
  const rankings = useMemo(() => {
    if (!statsInstance) return [];

    return statsInstance.getRankings({
      rankingType: selectedRankingType,
      timePeriod: 'total',
    });
  }, [statsInstance, selectedRankingType]);

  // Paginate rankings
  const paginatedRankings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return rankings.slice(startIndex, endIndex);
  }, [rankings, currentPage]);

  const totalPages = Math.ceil(rankings.length / ITEMS_PER_PAGE);

  // Memoize ranking type change handler
  const handleRankingTypeChange = useCallback((type: RankingType) => {
    setSelectedRankingType(type);
    setCurrentPage(1);
  }, []);

  // Memoize utility functions
  const getRankingIcon = useCallback((rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }, []);

  const getRankingColor = useCallback((rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'gray';
    if (rank === 3) return 'orange';
    return 'blue';
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
          <Card withBorder shadow='sm' radius='md' p='xl'>
            <Text ta='center' c='dimmed'>
              No messages have been uploaded yet. Please upload a chat file from the home page to view rankings.
            </Text>
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size='xl' py='xl'>
      <Stack gap='xl'>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Group justify='space-between' align='center'>
            <Group gap='md'>
              <Link to='/'>
                <Button variant='subtle' leftSection={<IconArrowLeft size={16} />}>
                  Back to Home
                </Button>
              </Link>
              <Title order={1} size='2.5rem' fw={800}>
                <IconTrophy size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                Rankings
              </Title>
              <Text size='lg' c='dimmed'>
                ({filteredMessages.length.toLocaleString()} messages)
              </Text>
            </Group>
          </Group>
        </motion.div>

        {/* Date Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <DateFilter />
        </motion.div>

        {/* Ranking Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Stack gap='md'>
              <Title order={3}>Ranking Type</Title>
              <Group gap='md'>
                {RANKING_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedRankingType === type.value;

                  return (
                    <motion.div key={type.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={isSelected ? 'filled' : 'light'}
                        color={type.color}
                        leftSection={<Icon size={16} />}
                        onClick={() => handleRankingTypeChange(type.value)}
                      >
                        {type.label}
                      </Button>
                    </motion.div>
                  );
                })}
              </Group>
            </Stack>
          </Card>
        </motion.div>

        {/* Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Stack gap='lg'>
            <Group justify='space-between' align='center'>
              <Title order={2}>Top Performers</Title>
              <Badge size='lg' variant='light' color='blue'>
                {rankings.length} participants
              </Badge>
            </Group>

            <Grid>
              <AnimatePresence mode='wait'>
                {paginatedRankings.map((ranking, index) => (
                  <Grid.Col key={ranking.author} span={{ base: 12, md: 6, lg: 4 }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 100,
                      }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Card
                        withBorder
                        shadow='sm'
                        radius='lg'
                        p='lg'
                        style={{
                          borderColor:
                            ranking.rank <= 3 ? `var(--mantine-color-${getRankingColor(ranking.rank)}-6)` : undefined,
                          borderWidth: ranking.rank <= 3 ? '2px' : '1px',
                        }}
                      >
                        <Stack gap='md'>
                          {/* Rank Badge */}
                          <Group justify='space-between' align='center'>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                            >
                              <Badge
                                size='xl'
                                variant='filled'
                                color={getRankingColor(ranking.rank)}
                                style={{ fontSize: '1.2rem', padding: '8px 16px' }}
                              >
                                {getRankingIcon(ranking.rank)}
                              </Badge>
                            </motion.div>

                            <Text size='sm' c='dimmed' ta='right'>
                              {ranking.percentage.toFixed(1)}%
                            </Text>
                          </Group>

                          {/* Author Name */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <Text fw={700} size='lg' ta='center'>
                              {ranking.author}
                            </Text>
                          </motion.div>

                          {/* Value */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
                          >
                            <Text fw={600} size='xl' ta='center' c={getRankingColor(ranking.rank)}>
                              {ranking.value.toLocaleString()}
                            </Text>
                          </motion.div>

                          {/* Change indicator */}
                          {ranking.change !== undefined && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                            >
                              <Text size='sm' ta='center' c={ranking.change >= 0 ? 'green' : 'red'} fw={500}>
                                {ranking.change >= 0 ? '+' : ''}
                                {ranking.change.toFixed(1)}%
                              </Text>
                            </motion.div>
                          )}
                        </Stack>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                ))}
              </AnimatePresence>
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Group justify='center' gap='md'>
                  <Button variant='light' disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                  </Button>
                  <Text size='sm' c='dimmed'>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <Button
                    variant='light'
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Group>
              </motion.div>
            )}
          </Stack>
        </motion.div>
      </Stack>
    </Container>
  );
}
