import fs from 'fs/promises';
import type { Message } from './data';

/**
 * Reads and processes a WhatsApp chat export file from the "chats" directory.
 * The chat files should be named in "DD-MM-YYYY.txt" format.
 * This function removes any U+200E (Left-to-Right Mark) characters that WhatsApp
 * may include in the exported text.
 *
 * @param name - The name of the chat file without extension (e.g. "08-07-25")
 * @returns A promise that resolves to the cleaned chat file content as a string
 * @throws {Error} If the file cannot be read or does not exist
 */
export async function getChatFile(name: string): Promise<string> {
  const content = await fs.readFile(`./chats/${name}.txt`, 'utf-8');
  return content.replace(/\u200e/g, '');
}

export async function getJsonFile(name: string): Promise<Message[]> {
  const content = await fs.readFile(`./data/${name}.json`, 'utf-8');
  return JSON.parse(content);
}
