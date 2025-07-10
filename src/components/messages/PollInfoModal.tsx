import { Modal, Stack, Group, Text, Badge, Divider, Card, Progress, Box } from '@mantine/core';
import { IconPill, IconChartBar, IconUsers } from '@tabler/icons-react';
import type { PollInfo } from '../../utils/content-parser';

interface PollInfoModalProps {
  pollInfo: PollInfo;
  author: string;
  timestamp: Date;
  opened: boolean;
  onClose: () => void;
}

export function PollInfoModal({ pollInfo, author, timestamp, opened, onClose }: PollInfoModalProps) {
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalVotes = pollInfo.options.reduce((sum, opt) => sum + opt.votes, 0);

  const getMostVotedOption = () => {
    return pollInfo.options.reduce((max, opt) => (opt.votes > max.votes ? opt : max));
  };

  return (
    <Modal opened={opened} onClose={onClose} title='Poll Information' size='lg' centered>
      <Stack gap='lg'>
        {/* Poll Header */}
        <Card withBorder shadow='sm' radius='md' p='lg'>
          <Group justify='space-between' align='flex-start'>
            <Group gap='sm' align='flex-start'>
              <IconPill size={24} color='var(--mantine-color-orange-6)' />
              <div>
                <Text fw={600} size='lg' lineClamp={2}>
                  {pollInfo.question}
                </Text>
                <Text size='sm' c='dimmed'>
                  Created by {author}
                </Text>
              </div>
            </Group>
            <Badge color='orange' variant='light' size='lg'>
              {totalVotes} votes
            </Badge>
          </Group>
        </Card>

        <Divider />

        {/* Poll Options */}
        <Stack gap='md'>
          <Group gap='sm' align='center'>
            <IconChartBar size={16} color='var(--mantine-color-blue-6)' />
            <Text fw={600} size='sm'>
              Poll Options
            </Text>
          </Group>

          {pollInfo.options.map((option, index) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const isMostVoted = option.votes === getMostVotedOption().votes && option.votes > 0;

            return (
              <Card
                key={index}
                withBorder
                shadow='sm'
                radius='md'
                p='md'
                style={{
                  borderColor: isMostVoted ? 'var(--mantine-color-green-6)' : undefined,
                  borderWidth: isMostVoted ? '2px' : '1px',
                }}
              >
                <Stack gap='xs'>
                  <Group justify='space-between' align='center'>
                    <Group gap='sm' align='center'>
                      <Text fw={500} size='sm' style={{ flex: 1 }}>
                        {option.option}
                      </Text>
                      {isMostVoted && (
                        <Badge color='green' variant='light' size='xs'>
                          Most Voted
                        </Badge>
                      )}
                    </Group>
                    <Group gap='xs'>
                      <Text size='sm' fw={600}>
                        {option.votes}
                      </Text>
                      <Text size='sm' c='dimmed'>
                        ({percentage.toFixed(1)}%)
                      </Text>
                    </Group>
                  </Group>

                  <Progress value={percentage} color={isMostVoted ? 'green' : 'blue'} size='sm' radius='xl' />
                </Stack>
              </Card>
            );
          })}
        </Stack>

        {/* Poll Statistics */}
        <Card withBorder shadow='sm' radius='md' p='lg' bg='gray.0'>
          <Stack gap='md'>
            <Group gap='sm' align='center'>
              <IconUsers size={16} color='var(--mantine-color-green-6)' />
              <Text fw={600} size='sm'>
                Poll Statistics
              </Text>
            </Group>

            <Group gap='lg'>
              <Box>
                <Text size='sm' c='dimmed'>
                  Total Votes
                </Text>
                <Text fw={600} size='lg'>
                  {totalVotes}
                </Text>
              </Box>

              <Box>
                <Text size='sm' c='dimmed'>
                  Options
                </Text>
                <Text fw={600} size='lg'>
                  {pollInfo.options.length}
                </Text>
              </Box>

              <Box>
                <Text size='sm' c='dimmed'>
                  Average Votes
                </Text>
                <Text fw={600} size='lg'>
                  {(totalVotes / pollInfo.options.length).toFixed(1)}
                </Text>
              </Box>
            </Group>
          </Stack>
        </Card>

        {/* Poll Summary */}
        <Card withBorder shadow='sm' radius='md' p='lg'>
          <Stack gap='xs'>
            <Text fw={600} size='sm'>
              Poll Summary
            </Text>
            <Text size='sm' c='dimmed'>
              This poll was created by {author} on {formatTimestamp(timestamp)}. It received {totalVotes} total votes
              across {pollInfo.options.length} options.
              {getMostVotedOption().votes > 0 &&
                ` The most popular option was "${getMostVotedOption().option}" with ${getMostVotedOption().votes} votes.`}
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Modal>
  );
}
