// Test streak calculation logic
function calculateStreaks(messages) {
  if (messages.length === 0) return { longestStreak: 0, currentStreak: 0 };

  const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const dates = sortedMessages.map((msg) => msg.timestamp.toDateString());
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  console.log('Unique dates:', uniqueDates);

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDateStr = uniqueDates[i - 1];
    const currDateStr = uniqueDates[i];
    if (prevDateStr && currDateStr) {
      const prevDate = new Date(prevDateStr);
      const currDate = new Date(currDateStr);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      console.log(`Comparing ${prevDateStr} to ${currDateStr}, dayDiff: ${dayDiff}`);

      if (dayDiff === 1) {
        tempStreak++;
        console.log(`Consecutive day found! tempStreak: ${tempStreak}`);
      } else {
        console.log(`Streak broken! Final tempStreak: ${tempStreak}`);
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  console.log(`Final longestStreak: ${longestStreak}`);

  // Calculate current streak
  const today = new Date().toDateString();
  const lastMessageDate = uniqueDates[uniqueDates.length - 1];
  if (lastMessageDate) {
    const lastMessageDateObj = new Date(lastMessageDate);
    const todayObj = new Date(today);
    const daysSinceLastMessage = (todayObj.getTime() - lastMessageDateObj.getTime()) / (1000 * 60 * 60 * 24);

    console.log(`Days since last message: ${daysSinceLastMessage}`);

    if (daysSinceLastMessage <= 1) {
      // Count backwards from the last message
      let streak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const currDateStr = uniqueDates[i];
        const nextDateStr = uniqueDates[i + 1];
        if (currDateStr && nextDateStr) {
          const currDate = new Date(currDateStr);
          const nextDate = new Date(nextDateStr);
          const dayDiff = (nextDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

          if (dayDiff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
      currentStreak = streak;
      console.log(`Current streak: ${currentStreak}`);
    }
  }

  return { longestStreak, currentStreak };
}

// Test with sample data
const testMessages = [
  { timestamp: new Date('2024-01-01T10:00:00') },
  { timestamp: new Date('2024-01-01T15:00:00') },
  { timestamp: new Date('2024-01-02T09:00:00') },
  { timestamp: new Date('2024-01-03T14:00:00') },
  { timestamp: new Date('2024-01-05T11:00:00') }, // Gap of 1 day
  { timestamp: new Date('2024-01-06T16:00:00') },
  { timestamp: new Date('2024-01-07T12:00:00') },
];

console.log('Testing streak calculation...');
const result = calculateStreaks(testMessages);
console.log('Result:', result);
