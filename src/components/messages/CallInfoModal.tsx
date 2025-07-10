import { Modal, Stack, Group, Text, Badge, Divider, Card } from '@mantine/core';
import { IconPhone, IconVideo, IconClock, IconUsers } from '@tabler/icons-react';
import type { CallInfo } from '../../utils/content-parser';

interface CallInfoModalProps {
  callInfo: CallInfo;
  author: string;
  timestamp: Date;
  opened: boolean;
  onClose: () => void;
}

export function CallInfoModal({ callInfo, author, timestamp, opened, onClose }: CallInfoModalProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCallTypeIcon = () => {
    return callInfo.type === 'video' ? <IconVideo size={20} /> : <IconPhone size={20} />;
  };

  return (
    <Modal opened={opened} onClose={onClose} title='Call Information' size='md' centered>
      <Stack gap='lg'>
        {/* Call Header */}
        <Card withBorder shadow='sm' radius='md' p='lg'>
          <Group justify='space-between' align='center'>
            <Group gap='sm'>
              {getCallTypeIcon()}
              <div>
                <Text fw={600} size='lg'>
                  {callInfo.type === 'video' ? 'Video Call' : 'Voice Call'}
                </Text>
                <Text size='sm' c='dimmed'>
                  by {author}
                </Text>
              </div>
            </Group>
            <Badge color={callInfo.missed ? 'red' : 'green'} variant='light' size='lg'>
              {callInfo.missed ? 'Missed' : 'Completed'}
            </Badge>
          </Group>
        </Card>

        <Divider />

        {/* Call Details */}
        <Stack gap='md'>
          <Group gap='md'>
            <Card withBorder shadow='sm' radius='md' p='md' style={{ flex: 1 }}>
              <Group gap='sm' align='center'>
                <IconClock size={16} color='var(--mantine-color-blue-6)' />
                <div>
                  <Text size='sm' c='dimmed'>
                    Duration
                  </Text>
                  <Text fw={600}>{formatDuration(callInfo.duration)}</Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow='sm' radius='md' p='md' style={{ flex: 1 }}>
              <Group gap='sm' align='center'>
                <IconUsers size={16} color='var(--mantine-color-green-6)' />
                <div>
                  <Text size='sm' c='dimmed'>
                    Participants
                  </Text>
                  <Text fw={600}>{callInfo.joined || 'Unknown'}</Text>
                </div>
              </Group>
            </Card>
          </Group>

          <Card withBorder shadow='sm' radius='md' p='md'>
            <Group gap='sm' align='center'>
              <div>
                <Text size='sm' c='dimmed'>
                  Call Time
                </Text>
                <Text fw={600}>{formatTimestamp(timestamp)}</Text>
              </div>
            </Group>
          </Card>
        </Stack>

        {/* Call Summary */}
        <Card withBorder shadow='sm' radius='md' p='lg' bg='gray.0'>
          <Stack gap='xs'>
            <Text fw={600} size='sm'>
              Call Summary
            </Text>
            <Text size='sm' c='dimmed'>
              {callInfo.missed
                ? `This was a missed ${callInfo.type} call initiated by ${author}.`
                : `This was a ${callInfo.type} call with ${callInfo.joined || 'unknown number of'} participants${
                    callInfo.duration ? ` lasting ${formatDuration(callInfo.duration)}` : ''
                  }.`}
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Modal>
  );
}
