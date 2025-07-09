import { useState } from 'react';

export function useUploadChat() {
  const [chatFile, setChatFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setChatFile(file);
  };

  return { chatFile, handleFileChange };
}
