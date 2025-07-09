import fs from 'fs';
import path from 'path';
import { getData } from './data';
import { writeJson } from './write-json';

async function writeChatToJson(chatName: string) {
  try {
    console.log(`Processing chat file: ${chatName}`);

    const dataDir = './data';
    const jsonFilePath = path.join(dataDir, `${chatName}.json`);
    const tempJsonPath = path.join(dataDir, `${chatName}.json.temp`);

    // Temporarily rename existing JSON file to force reading from chat file
    let jsonExists = false;
    if (fs.existsSync(jsonFilePath)) {
      jsonExists = true;
      fs.renameSync(jsonFilePath, tempJsonPath);
      console.log('📁 Temporarily moved existing JSON file to force chat parsing');
    }

    try {
      // Get the parsed data from chat file
      const data = await getData(chatName);

      // Write to JSON file
      writeJson(data, chatName);

      console.log(`✅ Successfully wrote ${data.length} messages to data/${chatName}.json`);
    } finally {
      // Restore the original JSON file if it existed
      if (jsonExists && fs.existsSync(tempJsonPath)) {
        fs.renameSync(tempJsonPath, jsonFilePath);
        console.log('📁 Restored original JSON file');
      }
    }
  } catch (error) {
    console.error('❌ Error processing chat file:', error);
    process.exit(1);
  }
}

// Get chat name from command line arguments
const chatName = process.argv[2];

if (!chatName) {
  console.error('❌ Please provide a chat file name');
  console.log('Usage: npm run write <chat-name>');
  console.log('Example: npm run write 10-07-25');
  process.exit(1);
}

// Only run if this file is executed directly
if (require.main === module) {
  writeChatToJson(chatName);
}
