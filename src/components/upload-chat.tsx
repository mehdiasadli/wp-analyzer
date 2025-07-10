import { useState, useCallback } from 'react';
import { FileInput, Stack, Tabs, Textarea, Button, Group, Text, Alert, Card, Progress } from '@mantine/core';
import { IconUpload, IconFileText, IconCheck } from '@tabler/icons-react';
import { ChatPreview } from './chat-preview';
import { ShowStatsButton } from './show-stats-button';
import { useData } from '../stores/data.store';
import { getMessagesFromText } from '../utils/data';

export function UploadChat() {
  const { chatFile, setChatFile, pastedText, setPastedText, setMessages, clearData } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = useCallback(
    async (file: File | null) => {
      setChatFile(file);
      setPastedText('');
      setError(null);
      setSuccess(false);
      setProgress(0);

      if (file) {
        try {
          setIsProcessing(true);

          // Show progress for large files
          if (file.size > 1024 * 1024) {
            // 1MB
            setProgress(10);
          }

          const text = await file.text();
          setProgress(50);

          const messages = getMessagesFromText(text);
          setProgress(90);

          setMessages(messages);
          setProgress(100);
          setSuccess(true);
        } catch (err) {
          console.error('File processing error:', err);
          setError("Failed to process the file. Please check if it's a valid chat export.");
        } finally {
          setIsProcessing(false);
          setProgress(0);
        }
      } else {
        setMessages([]);
      }
    },
    [setChatFile, setPastedText, setMessages]
  );

  const handleTextPaste = useCallback(() => {
    if (!pastedText.trim()) {
      setError('Please paste some chat text first.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProgress(50);

      const messages = getMessagesFromText(pastedText);
      setProgress(90);

      setMessages(messages);
      setProgress(100);
      setSuccess(true);
    } catch (err) {
      console.error('Text processing error:', err);
      setError("Failed to process the pasted text. Please check if it's a valid chat export format.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [pastedText, setMessages]);

  const handleClear = useCallback(() => {
    clearData();
    setError(null);
    setSuccess(false);
    setProgress(0);
  }, [clearData]);

  const hasData = chatFile || pastedText.trim();

  return (
    <Stack gap='lg'>
      <Tabs defaultValue='file' variant='pills' radius='md'>
        <Tabs.List>
          <Tabs.Tab value='file' leftSection={<IconUpload size={16} />}>
            Upload File
          </Tabs.Tab>
          <Tabs.Tab value='text' leftSection={<IconFileText size={16} />}>
            Paste Text
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='file' pt='lg'>
          <Stack gap='md'>
            <FileInput
              label='Upload Chat File'
              placeholder='Upload your chat export file (.txt)'
              accept='.txt'
              onChange={handleFileUpload}
              value={chatFile}
              leftSection={<IconUpload size={16} />}
              disabled={isProcessing}
            />
            <Text size='sm' c='dimmed'>
              Upload a .txt file exported from WhatsApp or Telegram
            </Text>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value='text' pt='lg'>
          <Stack gap='md'>
            <Textarea
              label='Paste Chat Text'
              placeholder='Paste your chat export text here...'
              value={pastedText}
              onChange={(event) => setPastedText(event.currentTarget.value)}
              minRows={8}
              maxRows={15}
              disabled={isProcessing}
            />
            <Text size='sm' c='dimmed'>
              Paste the raw text content from your chat export
            </Text>

            <Group gap='sm'>
              <Button
                onClick={handleTextPaste}
                loading={isProcessing}
                disabled={!pastedText.trim()}
                leftSection={<IconFileText size={16} />}
              >
                Process Text
              </Button>

              {pastedText && (
                <Button variant='light' onClick={() => setPastedText('')} disabled={isProcessing}>
                  Clear Text
                </Button>
              )}
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Progress Bar */}
      {isProcessing && progress > 0 && (
        <Stack gap='xs'>
          <Progress value={progress} size='md' radius='md' color='blue' />
          <Text size='sm' c='dimmed' ta='center'>
            Processing... {progress}%
          </Text>
        </Stack>
      )}

      {/* Status Messages */}
      {error && (
        <Alert color='red' title='Error' variant='light'>
          {error}
        </Alert>
      )}

      {success && (
        <Alert color='green' title='Success' variant='light' icon={<IconCheck size={16} />}>
          Chat data processed successfully! You can now view statistics and messages.
        </Alert>
      )}

      {/* Actions */}
      {hasData && (
        <Card withBorder shadow='sm' radius='md' p='lg'>
          <Stack gap='md'>
            <Group justify='space-between' align='center'>
              <Text fw={600}>Data Loaded</Text>
              <Button variant='light' color='red' onClick={handleClear} size='sm'>
                Clear All Data
              </Button>
            </Group>

            <Group gap='sm'>
              <ShowStatsButton />
            </Group>
          </Stack>
        </Card>
      )}

      {/* Preview */}
      {chatFile && <ChatPreview chatFile={chatFile} />}
    </Stack>
  );
}
