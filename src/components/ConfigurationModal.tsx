import { Modal, Stack, Title, Text, Select, Button, Alert, Group, Card, MultiSelect } from '@mantine/core';
import { IconUser, IconUsers, IconInfoCircle } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useData } from '../stores/data.store';
import { extractAuthorsForConfig } from '../utils/author-extractor';

interface ConfigurationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatContent: string;
}

export function ConfigurationModal({ opened, onClose, onConfirm, chatContent }: ConfigurationModalProps) {
  const { userNames, groupName, setUserNames, setGroupName } = useData();
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedUserNames, setSelectedUserNames] = useState<string[]>(userNames);
  const [selectedGroupName, setSelectedGroupName] = useState(groupName);
  const [isLoading, setIsLoading] = useState(false);

  // Extract authors when modal opens
  useEffect(() => {
    if (opened && chatContent) {
      setIsLoading(true);
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        const extractedAuthors = extractAuthorsForConfig(chatContent);
        setAuthors(extractedAuthors);
        setIsLoading(false);
      }, 100);
    }
  }, [opened, chatContent]);

  const handleConfirm = () => {
    // Map back "You (your messages)" to empty string for processing
    const actualUserNames = selectedUserNames
      .map((name) => (name === 'You (your messages)' ? '' : name))
      .filter((name) => name !== '');

    setUserNames(actualUserNames);
    setGroupName(selectedGroupName);
    onConfirm();
  };

  const canProceed = selectedGroupName && selectedGroupName !== 'You (your messages)';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Configure Your Chat'
      size='md'
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Stack gap='lg'>
        <Alert icon={<IconInfoCircle size={16} />} title='Configuration Required' color='blue' variant='light'>
          Before we can process your chat data, we need to know which name represents you and which represents the
          group. This helps us filter out system messages and properly identify your messages.
        </Alert>

        <Card withBorder shadow='sm' radius='md' p='lg'>
          <Stack gap='md'>
            <Title order={3} size='h4'>
              Select Your Name
            </Title>
            <Text size='sm' c='dimmed'>
              Choose the names that represent you in this chat. You can select multiple names or none at all. If you see
              "You (your messages)", that means WhatsApp exported your messages as "you".
            </Text>
            <MultiSelect
              label='Your Names (Optional)'
              placeholder='Select your names'
              data={authors}
              value={selectedUserNames}
              onChange={setSelectedUserNames}
              leftSection={<IconUser size={16} />}
              searchable
              disabled={isLoading}
              clearable
            />
          </Stack>
        </Card>

        <Card withBorder shadow='sm' radius='md' p='lg'>
          <Stack gap='md'>
            <Title order={3} size='h4'>
              Select Group Name
            </Title>
            <Text size='sm' c='dimmed'>
              Choose the name that represents the group or chat. This will be used to filter out system messages.
            </Text>
            <Select
              label='Group Name'
              placeholder='Select group name'
              data={authors}
              value={selectedGroupName}
              onChange={(value) => setSelectedGroupName(value || '')}
              leftSection={<IconUsers size={16} />}
              searchable
              disabled={isLoading}
            />
          </Stack>
        </Card>

        {!canProceed && selectedGroupName && (
          <Alert title='Invalid Selection' color='red' variant='light'>
            You cannot select "You (your messages)" as the group name.
          </Alert>
        )}

        <Group justify='flex-end' gap='md'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canProceed || isLoading} loading={isLoading}>
            Continue
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
