import { AI_NAME } from './constants';
import { useData } from '../stores/data.store';
import { type ContentInfo, parseContent } from './content-parser';
import { parseChatMessages } from './message-parser';
import { fromFileToString } from './from-file-to-string';

export type Message = {
  author: string;
  timestamp: Date;
  message: ContentInfo;
};

export async function getMessages(chatFile: File): Promise<Message[]> {
  const text = (await fromFileToString(chatFile)).replace(/\u200e/g, '');
  return processChatText(text);
}

export function getMessagesFromText(text: string): Message[] {
  const cleanedText = text.replace(/\u200e/g, '');
  return processChatText(cleanedText);
}

function processChatText(text: string): Message[] {
  const messages = parseChatMessages(text);

  // Pre-filter messages to reduce processing overhead
  const filteredMessages = messages.filter((msg) => {
    const { groupName } = useData.getState();

    // Early return for common exclusions
    if (msg.author === groupName || msg.author === AI_NAME) return false;

    // Basic content validation
    if (!msg.content || msg.content.length === 0) return false;

    return true;
  });

  // Process messages in batches for better performance
  const batchSize = 1000;
  const parsedMessages: Message[] = [];

  for (let i = 0; i < filteredMessages.length; i += batchSize) {
    const batch = filteredMessages.slice(i, i + batchSize);

    const batchResults = batch
      .map((msg) => {
        try {
          const parsedContent = parseContent(msg);
          if (!parsedContent) return null;

          return {
            author: msg.author,
            timestamp: msg.timestamp,
            message: parsedContent,
          };
        } catch {
          return null;
        }
      })
      .filter((m): m is Message => m !== null);

    parsedMessages.push(...batchResults);
  }

  return parsedMessages;
}
