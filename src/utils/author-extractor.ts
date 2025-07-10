import { AI_NAME } from './constants';

// Pre-compile regex patterns for better performance
const TIMESTAMP_PATTERN = /^\[\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}:\d{2}\]/;
const MESSAGE_REGEX = /^\[(?<date>\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}:\d{2})\] (?<author>[^:]+): (?<content>[\s\S]*)$/;

/**
 * Extracts unique authors from chat content without full parsing
 * This is optimized for performance when we only need author names
 *
 * @param chatContent - The complete chat file content as a string
 * @returns Array of unique author names
 */
export function extractAuthors(chatContent: string): string[] {
  const lines = chatContent.split('\n');
  const authors = new Set<string>();

  for (const line of lines) {
    // If this line starts with a timestamp, it's a new message
    if (TIMESTAMP_PATTERN.test(line.trim())) {
      const match = line.match(MESSAGE_REGEX);
      if (match?.groups?.author) {
        const author = match.groups.author.trim();
        if (author && author.length > 0 && author !== AI_NAME) {
          authors.add(author);
        }
      }
    }
  }

  return Array.from(authors).sort();
}

/**
 * Extracts unique authors from chat content and maps "you" to a placeholder
 * This is used for the configuration modal
 *
 * @param chatContent - The complete chat file content as a string
 * @returns Array of unique author names with "you" mapped to "You (your messages)"
 */
export function extractAuthorsForConfig(chatContent: string): string[] {
  const lines = chatContent.split('\n');
  const authors = new Set<string>();

  for (const line of lines) {
    // If this line starts with a timestamp, it's a new message
    if (TIMESTAMP_PATTERN.test(line.trim())) {
      const match = line.match(MESSAGE_REGEX);
      if (match?.groups?.author) {
        const author = match.groups.author.trim();
        if (author && author.length > 0 && author !== AI_NAME) {
          // Map "you" to a more descriptive name for the UI
          if (/^you$/i.test(author)) {
            authors.add('You (your messages)');
          } else {
            authors.add(author);
          }
        }
      }
    }
  }

  return Array.from(authors).sort();
}
