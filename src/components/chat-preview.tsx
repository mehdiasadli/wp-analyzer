import { useState, useEffect } from 'react';
import { Badge, Card, Center, Group, Loader, Table, Text, Stack } from '@mantine/core';
import dayjs from 'dayjs';
import { getMessages, type Message } from '../utils/data';
import { useData } from '../stores/data.store';

interface ChatPreviewProps {
  chatFile: File;
}

export function ChatPreview({ chatFile }: ChatPreviewProps) {
  const { messages, setMessages } = useData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);

      try {
        const parsedMessages = await getMessages(chatFile);
        setMessages(parsedMessages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [chatFile, setMessages]);

  function displayMessageContent(message: Message['message']) {
    if (message.type === 'text') return <Text fz='sm'>{message.content}</Text>;
    if (message.type === 'call')
      return (
        <Group>
          <Badge>
            {message.call?.missed ? 'missed ' : ''}
            {message.call?.type} call
          </Badge>
          {message.call?.duration && message.call?.joined && (
            <Text fz='sm'>
              {message.call?.duration} sec • {message.call?.joined} joined
            </Text>
          )}
        </Group>
      );
    if (message.type === 'poll')
      return (
        <Group>
          <Badge>Poll: {message.poll?.question}</Badge>
          <Text fz='sm'>{message.poll?.options.map((option) => option).join(', ')}</Text>
        </Group>
      );

    return <Badge>{message.type}</Badge>;
  }

  return loading ? (
    <Center mt={10}>
      <Loader size='sm' />
    </Center>
  ) : (
    <Card withBorder shadow='sm' radius='md' mt={20}>
      <Stack>
        <Text fw={500} size='sm' c='dimmed'>
          Preview of first 10 messages
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Author</Table.Th>
              <Table.Th>Timestamp</Table.Th>
              <Table.Th>Message</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {messages.slice(0, 10).map((message) => (
              <Table.Tr key={message.timestamp.getTime()}>
                <Table.Td>{message.author}</Table.Td>
                <Table.Td>{dayjs(message.timestamp).format('DD.MM.YYYY, HH:mm')}</Table.Td>
                <Table.Td>{displayMessageContent(message.message)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}
