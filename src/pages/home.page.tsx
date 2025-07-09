import { Card, Container, Stack, Text, Title, Group, Badge, Grid, Paper } from '@mantine/core';
import { IconUpload, IconChartBar, IconMessage, IconUsers, IconActivity, IconTrophy } from '@tabler/icons-react';
import { UploadChat } from '../components/upload-chat';
import { useData } from '../stores/data.store';
import { useFilteredMessages } from '../hooks/useFilteredMessages';

export function HomePage() {
  const { messages } = useData();
  const filteredMessages = useFilteredMessages();

  const features = [
    {
      icon: IconChartBar,
      title: 'Comprehensive Analytics',
      description: 'Get detailed insights into your chat activity with advanced statistics and visualizations.',
      color: 'blue',
    },
    {
      icon: IconTrophy,
      title: 'User Rankings',
      description: 'See who leads the conversation with animated ranking cards and performance metrics.',
      color: 'gold',
    },
    {
      icon: IconUsers,
      title: 'User Statistics',
      description: 'Analyze individual user activity, engagement patterns, and contribution metrics.',
      color: 'green',
    },
    {
      icon: IconMessage,
      title: 'Message Analysis',
      description: 'Browse and search through all messages with powerful filtering and sorting options.',
      color: 'violet',
    },
    {
      icon: IconActivity,
      title: 'Activity Tracking',
      description: 'Track activity patterns, streaks, and engagement trends over time.',
      color: 'orange',
    },
  ];

  return (
    <Container size='xl' py='xl'>
      <Stack gap='xl'>
        {/* Hero Section */}
        <Stack gap='lg' ta='center'>
          <Title order={1} size='3rem' fw={800} c='blue'>
            WP Activity Analyzer
          </Title>
          <Text size='xl' c='dimmed' maw={600} mx='auto'>
            Upload your WhatsApp chat export and gain powerful insights into your group activity, user engagement, and
            communication patterns.
          </Text>

          {messages.length > 0 && (
            <Group justify='center' mt='md'>
              <Badge size='lg' variant='light' color='green'>
                {filteredMessages.length.toLocaleString()} of {messages.length.toLocaleString()} messages loaded
              </Badge>
            </Group>
          )}
        </Stack>

        {/* Upload Section */}
        <Card withBorder shadow='lg' radius='lg' p='xl'>
          <Stack gap='lg'>
            <Group justify='center'>
              <IconUpload size={32} color='var(--mantine-color-blue-6)' />
              <Title order={2}>Upload Your Chat</Title>
            </Group>
            <UploadChat />
          </Stack>
        </Card>

        {/* Features Section */}
        <Stack gap='lg'>
          <Title order={2} ta='center' mb='lg'>
            Powerful Features
          </Title>
          <Grid>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Grid.Col key={feature.title} span={{ base: 12, sm: 6, lg: 3 }}>
                  <Paper withBorder shadow='sm' radius='md' p='lg' h='100%'>
                    <Stack gap='md' align='center' ta='center'>
                      <Icon size={32} color={`var(--mantine-color-${feature.color}-6)`} />
                      <Title order={4}>{feature.title}</Title>
                      <Text size='sm' c='dimmed'>
                        {feature.description}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              );
            })}
          </Grid>
        </Stack>

        {/* Quick Stats Preview */}
        {messages.length > 0 && (
          <Card withBorder shadow='sm' radius='md' p='lg'>
            <Stack gap='md'>
              <Title order={3} ta='center'>
                Quick Preview
              </Title>
              <Text ta='center' c='dimmed'>
                Your chat has been successfully loaded! Navigate to the Statistics or Messages pages to explore your
                data in detail.
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
