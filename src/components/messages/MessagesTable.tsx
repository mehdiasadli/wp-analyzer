import { Paper, Table, Text, Badge, Tooltip, ScrollArea, Group, Box, useMantineTheme, ActionIcon } from '@mantine/core';
import { IconMessage, IconPhone, IconPill, IconEye } from '@tabler/icons-react';
import { useState, useMemo, useCallback } from 'react';
import type { Message } from '../../utils/data';
import type { ContentType, MessageStatus, CallInfo, PollInfo } from '../../utils/content-parser';
import { MessageContentModal } from './MessageContentModal';
import { CallInfoModal } from './CallInfoModal';
import { PollInfoModal } from './PollInfoModal';

interface MessagesTableProps {
  messages: Message[];
}

export function MessagesTable({ messages }: MessagesTableProps) {
  const theme = useMantineTheme();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [callModalOpened, setCallModalOpened] = useState(false);
  const [pollModalOpened, setPollModalOpened] = useState(false);
  const [selectedCallMessage, setSelectedCallMessage] = useState<Message | null>(null);
  const [selectedPollMessage, setSelectedPollMessage] = useState<Message | null>(null);

  // Memoize formatting functions
  const formatTimestamp = useCallback((timestamp: Date) => {
    return timestamp.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Memoize color functions
  const getStatusColor = useCallback((status: MessageStatus) => {
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
  }, []);

  const getTypeColor = useCallback((type: ContentType) => {
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
  }, []);

  // Memoize formatting functions
  const formatCallInfo = useCallback((call: CallInfo | null) => {
    if (!call) return null;

    const type = call.type === 'voice' ? 'Voice' : 'Video';
    const missed = call.missed ? ' (Missed)' : '';
    const duration = call.duration ? ` - ${call.duration}s` : '';
    const joined = call.joined ? ` - ${call.joined} joined` : '';

    return `${type}${missed}${duration}${joined}`;
  }, []);

  const formatPollInfo = useCallback((poll: PollInfo | null) => {
    if (!poll) return null;

    const totalVotes = poll.options.reduce((sum: number, opt: { option: string; votes: number }) => sum + opt.votes, 0);
    return `${poll.question} (${totalVotes} votes)`;
  }, []);

  const truncateContent = useCallback((content: string | null, maxLength: number = 100) => {
    if (!content) return null;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }, []);

  const getContentIcon = useCallback((type: ContentType) => {
    switch (type) {
      case 'call':
        return <IconPhone size={16} />;
      case 'poll':
        return <IconPill size={16} />;
      default:
        return <IconMessage size={16} />;
    }
  }, []);

  // Memoize table styles
  const tableStyles = useMemo(
    () =>
      ({
        '--mantine-table-border-color': theme.colors.gray[3],
        '--mantine-table-striped-color': theme.colors.gray[0],
        '--mantine-table-hover-color': theme.colors.blue[0],
      }) as React.CSSProperties,
    [theme.colors]
  );

  // Memoize row rendering
  const renderRow = useCallback(
    (message: Message, index: number) => {
      const callInfo = formatCallInfo(message.message.call);
      const pollInfo = formatPollInfo(message.message.poll);
      const truncatedContent = truncateContent(message.message.content, 80);

      return (
        <Table.Tr key={`${message.author}-${message.timestamp.getTime()}-${index}`}>
          <Table.Td>
            <Box p='xs'>
              <Text fw={600} size='sm' c='dark.7'>
                {message.author}
              </Text>
            </Box>
          </Table.Td>
          <Table.Td>
            <Box p='xs'>
              <Text size='sm' c='dimmed' style={{ fontFamily: 'monospace' }}>
                {formatTimestamp(message.timestamp)}
              </Text>
            </Box>
          </Table.Td>
          <Table.Td>
            <Box p='xs'>
              <Badge
                color={getTypeColor(message.message.type)}
                size='sm'
                variant='light'
                leftSection={getContentIcon(message.message.type)}
              >
                {message.message.type}
              </Badge>
            </Box>
          </Table.Td>
          <Table.Td>
            <Box p='xs'>
              <Badge color={getStatusColor(message.message.status)} size='sm' variant='dot'>
                {message.message.status}
              </Badge>
            </Box>
          </Table.Td>
          <Table.Td>
            <Box p='xs' style={{ maxWidth: '300px' }}>
              {message.message.content ? (
                <Group gap='xs' align='center'>
                  <Tooltip label={message.message.content} multiline w={300} position='top' withArrow>
                    <Text
                      size='sm'
                      lineClamp={2}
                      style={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => {
                        setSelectedMessage(message);
                        setModalOpened(true);
                      }}
                    >
                      {truncatedContent}
                    </Text>
                  </Tooltip>
                  <ActionIcon
                    size='sm'
                    variant='subtle'
                    color='blue'
                    onClick={() => {
                      setSelectedMessage(message);
                      setModalOpened(true);
                    }}
                    title='View full content'
                  >
                    <IconEye size={14} />
                  </ActionIcon>
                </Group>
              ) : (
                <Text size='sm' c='dimmed'>
                  No content
                </Text>
              )}
            </Box>
          </Table.Td>
          <Table.Td>
            <Box p='xs'>
              {callInfo ? (
                <Group gap='xs' align='center'>
                  <Tooltip label='View call details' position='top' withArrow>
                    <Text
                      size='sm'
                      c='dimmed'
                      style={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => {
                        setSelectedCallMessage(message);
                        setCallModalOpened(true);
                      }}
                    >
                      {callInfo}
                    </Text>
                  </Tooltip>
                  <ActionIcon
                    size='sm'
                    variant='subtle'
                    color='blue'
                    onClick={() => {
                      setSelectedCallMessage(message);
                      setCallModalOpened(true);
                    }}
                    title='View call details'
                  >
                    <IconEye size={14} />
                  </ActionIcon>
                </Group>
              ) : (
                <Text size='sm' c='dimmed'>
                  -
                </Text>
              )}
            </Box>
          </Table.Td>
          <Table.Td>
            <Box p='xs'>
              {pollInfo ? (
                <Group gap='xs' align='center'>
                  <Tooltip label='View poll details' position='top' withArrow>
                    <Text
                      size='sm'
                      c='dimmed'
                      style={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => {
                        setSelectedPollMessage(message);
                        setPollModalOpened(true);
                      }}
                    >
                      {pollInfo}
                    </Text>
                  </Tooltip>
                  <ActionIcon
                    size='sm'
                    variant='subtle'
                    color='blue'
                    onClick={() => {
                      setSelectedPollMessage(message);
                      setPollModalOpened(true);
                    }}
                    title='View poll details'
                  >
                    <IconEye size={14} />
                  </ActionIcon>
                </Group>
              ) : (
                <Text size='sm' c='dimmed'>
                  -
                </Text>
              )}
            </Box>
          </Table.Td>
        </Table.Tr>
      );
    },
    [
      formatTimestamp,
      getStatusColor,
      getTypeColor,
      getContentIcon,
      formatCallInfo,
      formatPollInfo,
      truncateContent,
      setSelectedCallMessage,
      setCallModalOpened,
      setSelectedPollMessage,
      setPollModalOpened,
    ]
  );

  return (
    <Paper withBorder shadow='sm' radius='md' p='md'>
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders style={tableStyles}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: '120px' }}>Author</Table.Th>
              <Table.Th style={{ minWidth: '140px' }}>Timestamp</Table.Th>
              <Table.Th style={{ minWidth: '100px' }}>Type</Table.Th>
              <Table.Th style={{ minWidth: '80px' }}>Status</Table.Th>
              <Table.Th style={{ minWidth: '200px' }}>Content</Table.Th>
              <Table.Th style={{ minWidth: '150px' }}>Call Info</Table.Th>
              <Table.Th style={{ minWidth: '150px' }}>Poll Info</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{messages.map((message, index) => renderRow(message, index))}</Table.Tbody>
        </Table>
      </ScrollArea>

      <MessageContentModal
        message={selectedMessage}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setSelectedMessage(null);
        }}
      />

      {selectedCallMessage?.message.call && (
        <CallInfoModal
          callInfo={selectedCallMessage.message.call}
          author={selectedCallMessage.author}
          timestamp={selectedCallMessage.timestamp}
          opened={callModalOpened}
          onClose={() => {
            setCallModalOpened(false);
            setSelectedCallMessage(null);
          }}
        />
      )}

      {selectedPollMessage?.message.poll && (
        <PollInfoModal
          pollInfo={selectedPollMessage.message.poll}
          author={selectedPollMessage.author}
          timestamp={selectedPollMessage.timestamp}
          opened={pollModalOpened}
          onClose={() => {
            setPollModalOpened(false);
            setSelectedPollMessage(null);
          }}
        />
      )}
    </Paper>
  );
}
