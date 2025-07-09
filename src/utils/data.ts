import { GROUP_NAME } from './constants';
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
  const parsedMessages = messages
    .map((msg) => ({
      author: msg.author,
      timestamp: msg.timestamp,
      message: parseContent(msg),
    }))
    .filter((m) => m.author !== GROUP_NAME)
    .filter((m) => m.message !== null)
    .filter((m) => {
      if (!m.message) return false;
      if (m.message.type !== 'text') return true;
      if (!m.message.content) return false;
      if (m.message.content.length <= 0) return false;

      return true;
    });

  return parsedMessages as Message[];
}
