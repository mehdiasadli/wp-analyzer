import { useState, useMemo } from 'react';
import { Container, Stack, Title, Group, Button, Text, Card, Grid, Badge, Paper } from '@mantine/core';
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
  { value: 'message_points', label: 'Message Points', icon: IconTrophy, color: 'gold' },
  { value: 'activity_score', label: 'Activity Score', icon: IconActivity, color: 'green' },
];

const ITEMS_PER_PAGE = 10;

export function RankingPage() {
  const { messages } = useData();
  const filteredMessages = useFilteredMessages();
  const [selectedRankingType, setSelectedRankingType] = useState<RankingType>('message_count');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate rankings
  const rankings = useMemo(() => {
    if (filteredMessages.length === 0) return [];

    const stats = new Stats(filteredMessages);
    return stats.getRankings({
      rankingType: selectedRankingType,
      timePeriod: 'total',
    });
  }, [filteredMessages, selectedRankingType]);

  // Paginate rankings
  const paginatedRankings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return rankings.slice(startIndex, endIndex);
  }, [rankings, currentPage]);

  const totalPages = Math.ceil(rankings.length / ITEMS_PER_PAGE);

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

  const getRankingIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankingColor = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'gray';
    if (rank === 3) return 'orange';
    return 'blue';
  };

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
                        onClick={() => {
                          setSelectedRankingType(type.value);
                          setCurrentPage(1);
                        }}
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
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1 + 0.3,
                                type: 'spring',
                                stiffness: 200,
                              }}
                            >
                              <Badge
                                size='xl'
                                variant='filled'
                                color={getRankingColor(ranking.rank)}
                                style={{ fontSize: ranking.rank <= 3 ? '1.2rem' : '1rem' }}
                              >
                                {getRankingIcon(ranking.rank)}
                              </Badge>
                            </motion.div>

                            {ranking.change && (
                              <Badge
                                variant='light'
                                color={ranking.change > 0 ? 'green' : ranking.change < 0 ? 'red' : 'gray'}
                              >
                                {ranking.change > 0 ? '+' : ''}
                                {ranking.change}
                              </Badge>
                            )}
                          </Group>

                          {/* User Info */}
                          <Stack gap='xs' align='center'>
                            <Text size='lg' fw={600} ta='center'>
                              {ranking.author}
                            </Text>

                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ranking.percentage}%` }}
                              transition={{
                                duration: 1,
                                delay: index * 0.1 + 0.5,
                                ease: 'easeOut',
                              }}
                            >
                              <Paper
                                h={8}
                                radius='xl'
                                bg='blue'
                                style={{
                                  background: `linear-gradient(90deg, var(--mantine-color-blue-6) ${ranking.percentage}%, var(--mantine-color-gray-2) ${ranking.percentage}%)`,
                                }}
                              />
                            </motion.div>

                            <Group gap='xs' justify='center'>
                              <Text size='xl' fw={700} c={getRankingColor(ranking.rank)}>
                                {ranking.value.toLocaleString()}
                              </Text>
                              <Text size='sm' c='dimmed'>
                                ({ranking.percentage.toFixed(1)}%)
                              </Text>
                            </Group>
                          </Stack>
                        </Stack>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                ))}
              </AnimatePresence>
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Group justify='center' gap='sm'>
                  <Button variant='light' disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                  </Button>

                  <Group gap='xs'>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <motion.div key={page} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant={currentPage === page ? 'filled' : 'light'}
                          size='sm'
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </motion.div>
                    ))}
                  </Group>

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
