import { FileInput, Stack } from '@mantine/core';
import { ChatPreview } from './chat-preview';
import { ShowStatsButton } from './show-stats-button';
import { useData } from '../stores/data.store';

export function UploadChat() {
  const { chatFile, setChatFile } = useData();

  return (
    <Stack>
      <FileInput
        label='Upload Chat'
        placeholder='Upload your chat file'
        accept='.txt'
        onChange={(file) => setChatFile(file)}
        value={chatFile}
      />
      {chatFile && <ShowStatsButton />}
      {chatFile && <ChatPreview chatFile={chatFile} />}
    </Stack>
  );
}
