import { Modal, Text, Group, Badge, Stack, ScrollArea, Paper, Divider, Box } from '@mantine/core';
import { IconMessage, IconPhone, IconPill } from '@tabler/icons-react';
import type { Message } from '../../utils/data';
import type { ContentType, MessageStatus } from '../../utils/content-parser';

interface MessageContentModalProps {
  message: Message | null;
  opened: boolean;
  onClose: () => void;
}

export function MessageContentModal({ message, opened, onClose }: MessageContentModalProps) {
  if (!message) return null;

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get status badge color
  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'edited':
        return 'blue';
      case 'deleted':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get content type badge color
  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case 'text':
        return 'blue';
      case 'image':
        return 'green';
      case 'video':
        return 'purple';
      case 'audio':
        return 'orange';
      case 'document':
        return 'cyan';
      case 'sticker':
        return 'pink';
      case 'call':
        return 'red';
      case 'poll':
        return 'yellow';
      case 'gif':
        return 'lime';
      case 'contact':
        return 'teal';
      case 'video note':
        return 'violet';
      default:
        return 'gray';
    }
  };

  // Get content icon
  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'call':
        return <IconPhone size={16} />;
      case 'poll':
        return <IconPill size={16} />;
      default:
        return <IconMessage size={16} />;
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title='Message Details' size='lg' radius='md' centered>
      <Stack gap='lg'>
        {/* Header Information */}
        <Paper p='md' withBorder radius='md'>
          <Stack gap='md'>
            {/* Author and Timestamp */}
            <Group justify='space-between' align='flex-start'>
              <Stack gap='xs'>
                <Text fw={700} size='lg' c='dark.7'>
                  {message.author}
                </Text>
                <Text size='sm' c='dimmed' style={{ fontFamily: 'monospace' }}>
                  {formatTimestamp(message.timestamp)}
                </Text>
              </Stack>

              <Group gap='xs'>
                <Badge
                  color={getTypeColor(message.message.type)}
                  size='md'
                  variant='light'
                  leftSection={getContentIcon(message.message.type)}
                >
                  {message.message.type}
                </Badge>
                <Badge color={getStatusColor(message.message.status)} size='md' variant='dot'>
                  {message.message.status}
                </Badge>
              </Group>
            </Group>

            <Divider />

            {/* Call Info */}
            {message.message.call && (
              <Box>
                <Text fw={600} size='sm' c='blue.7' mb='xs'>
                  Call Information
                </Text>
                <Text size='sm'>
                  Type: {message.message.call.type === 'voice' ? 'Voice Call' : 'Video Call'}
                  {message.message.call.missed && ' (Missed)'}
                  {message.message.call.duration && ` - Duration: ${message.message.call.duration} seconds`}
                  {message.message.call.joined && ` - ${message.message.call.joined} joined`}
                </Text>
              </Box>
            )}

            {/* Poll Info */}
            {message.message.poll && (
              <Box>
                <Text fw={600} size='sm' c='orange.7' mb='xs'>
                  Poll Information
                </Text>
                <Text size='sm' fw={500} mb='xs'>
                  {message.message.poll.question}
                </Text>
                <Stack gap='xs'>
                  {message.message.poll.options.map((option, index) => (
                    <Text key={index} size='sm' c='dimmed'>
                      • {option.option}: {option.votes} votes
                    </Text>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Content */}
        <Paper p='md' withBorder radius='md'>
          <Text fw={600} size='sm' mb='md' c='dark.7'>
            Message Content
          </Text>
          <ScrollArea h={300} type='auto'>
            {message.message.content ? (
              <Text
                size='sm'
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
              >
                {message.message.content}
              </Text>
            ) : (
              <Text size='sm' c='dimmed' fs='italic'>
                No content available
              </Text>
            )}
          </ScrollArea>
        </Paper>
      </Stack>
    </Modal>
  );
}
