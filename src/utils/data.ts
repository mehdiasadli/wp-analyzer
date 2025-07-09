import fs from 'fs';
import path from 'path';
import { GROUP_NAME } from './constants';
import { type ContentInfo, parseContent } from './content-parser';
import { getChatFile } from './get-chat-file';
import { parseChatMessages } from './message-parser';
import { fromFileToString } from './from-file-to-string';

export type Message = {
  author: string;
  timestamp: Date;
  message: ContentInfo;
};

export async function getMessages(chatFile: File): Promise<Message[]> {
  const text = (await fromFileToString(chatFile)).replace(/\u200e/g, '');
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

export async function getData(name: string) {
  const dataDir = './data';
  const jsonFilePath = path.join(dataDir, `${name}.json`);

  // Check if JSON file exists
  if (fs.existsSync(jsonFilePath)) {
    try {
      console.log(`Reading data from JSON file: ${jsonFilePath}`);
      const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
      const messages = JSON.parse(jsonData);

      // Convert timestamp strings back to Date objects
      return messages.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })) as Message[];
    } catch (error) {
      console.error(`Error reading JSON file: ${error}`);
      console.log('Falling back to chat file parsing...');
    }
  }

  // Fallback to original chat file parsing if JSON doesn't exist or fails
  console.log(`Reading data from chat file: ${name}`);
  const chatContent = await getChatFile(name);
  const messages = parseChatMessages(chatContent).filter((msg) => msg.author !== GROUP_NAME);
  const parsedMessages = messages
    .map((msg) => ({
      author: msg.author,
      timestamp: msg.timestamp,
      message: parseContent(msg),
    }))
    .filter((m) => m.message !== null);

  // Write to JSON file
  fs.writeFileSync(jsonFilePath, JSON.stringify(parsedMessages, null, 2));

  return parsedMessages as Message[];
}
