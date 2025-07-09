import fs from 'fs';
import path from 'path';
import type { Message } from './data';

export function writeJson(data: Message[], name: string) {
  const dataDir = './data';
  const filePath = path.join(dataDir, `${name}.json`);

  // Create the data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Data written to: ${filePath}`);
}
