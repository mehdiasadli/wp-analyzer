import { getData } from './data';
import { writeJson } from './write-json';

// Example usage
async function main() {
  try {
    const data = await getData('08-07-25');
    writeJson(data, '08-07-25');
  } catch (error) {
    console.error('Error reading chat file:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}
