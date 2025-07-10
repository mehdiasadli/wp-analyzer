import { useData } from '../stores/data.store';

export interface MessageInfo {
  author: string;
  content: string;
  timestamp: Date;
}

// Pre-compile regex patterns for better performance
const TIMESTAMP_PATTERN = /^\[\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}:\d{2}\]/;
const MESSAGE_REGEX = /^\[(?<date>\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}:\d{2})\] (?<author>[^:]+): (?<content>[\s\S]*)$/;

/**
 * Separates the entire chat content into individual messages.
 * Handles multi-line messages by looking for the timestamp pattern at the start of each message.
 *
 * @param chatContent - The complete chat file content as a string
 * @returns Array of individual message strings
 */
export function getSeparateMessages(chatContent: string): string[] {
  const lines = chatContent.split('\n');
  const messages: string[] = [];
  let currentMessage = '';

  for (const line of lines) {
    // If this line starts with a timestamp, it's a new message
    if (TIMESTAMP_PATTERN.test(line.trim())) {
      // Save the previous message if it exists
      if (currentMessage.trim()) {
        messages.push(currentMessage.trim());
      }
      // Start a new message
      currentMessage = line;
    } else {
      // This line is part of the current message (multi-line content)
      if (currentMessage) {
        currentMessage += '\n' + line;
      }
    }
  }

  // Don't forget the last message
  if (currentMessage.trim()) {
    messages.push(currentMessage.trim());
  }

  return messages.filter((msg) => msg.trim().length > 0);
}

/**
 * Extracts date, author, and content information from a single message.
 *
 * @param message - A single message string in WhatsApp format
 * @returns MessageInfo object with parsed date, author, and content
 * @throws Error if the message format is invalid
 */
export function getMessageInfo(message: string): MessageInfo {
  const match = message.match(MESSAGE_REGEX);

  if (!match || !match.groups) {
    throw new Error(`Invalid message format: ${message.substring(0, 100)}...`);
  }

  const { date, author, content } = match.groups;

  // Type guard to ensure all required fields exist
  if (!date || !author || content === undefined) {
    throw new Error(`Missing required fields in message: ${message.substring(0, 100)}...`);
  }

  // Parse the date string into a Date object
  const [datePart, timePart] = date.split(', ');

  // Validate that date and time parts exist
  if (!datePart || !timePart) {
    throw new Error(`Invalid date format in message: ${date}`);
  }

  const [day, month, year] = datePart.split('.');
  const [hour, minute, second] = timePart.split(':');

  // Validate that all date components exist
  if (!day || !month || !year || !hour || !minute || !second) {
    throw new Error(`Invalid date format in message: ${date}`);
  }

  // WhatsApp exports use 2-digit years, so we need to convert to full year
  const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);

  const timestamp = new Date(
    fullYear,
    parseInt(month) - 1, // Month is 0-indexed in JavaScript
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );

  return {
    author: getAuthor(author.trim()),
    content: content.trim(),
    timestamp,
  };
}

function getAuthor(author: string) {
  const { userNames } = useData.getState();

  if (/^you$/i.test(author)) {
    // If user has configured names, use the first one (or keep "you" if none configured)
    return userNames.length > 0 ? userNames[0] || author : author;
  }

  return author;
}

/**
 * Parses the entire chat content and returns an array of MessageInfo objects.
 * This is a convenience function that combines getSeparateMessages and getMessageInfo.
 *
 * @param chatContent - The complete chat file content as a string
 * @returns Array of MessageInfo objects
 */
export function parseChatMessages(chatContent: string): MessageInfo[] {
  const messages = getSeparateMessages(chatContent);
  const messageInfos: MessageInfo[] = [];

  // Process messages in batches for better performance
  const batchSize = 500;

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);

    for (const message of batch) {
      try {
        const info = getMessageInfo(message);
        messageInfos.push(info);
      } catch {
        // continue processing other messages
      }
    }
  }

  return messageInfos;
}
