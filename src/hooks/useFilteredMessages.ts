import { useMemo } from 'react';
import { useData } from '../stores/data.store';

export function useFilteredMessages() {
  const { messages, startDate, endDate } = useData();

  const filteredMessages = useMemo(() => {
    if (messages.length === 0) {
      return messages;
    }

    // Determine effective start and end dates
    let effectiveStartDate: Date;
    let effectiveEndDate: Date;

    // If no start date provided, use the first message's date
    if (!startDate) {
      effectiveStartDate = new Date(Math.min(...messages.map((msg) => msg.timestamp.getTime())));
    } else {
      effectiveStartDate = new Date(startDate);
    }

    // If no end date provided, use today
    if (!endDate) {
      effectiveEndDate = new Date();
    } else {
      effectiveEndDate = new Date(endDate);
    }

    console.log('Date filtering debug:', {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      effectiveStartDate: effectiveStartDate.toISOString(),
      effectiveEndDate: effectiveEndDate.toISOString(),
      totalMessages: messages.length,
      firstMessageDate: messages[0]?.timestamp.toISOString(),
      lastMessageDate: messages[messages.length - 1]?.timestamp.toISOString(),
    });

    const filtered = messages.filter((message) => {
      const messageDate = message.timestamp;

      // Message should be >= start date AND <= end date
      const isInRange = messageDate >= effectiveStartDate && messageDate <= effectiveEndDate;

      return isInRange;
    });

    console.log('Filtered messages count:', filtered.length);
    return filtered;
  }, [messages, startDate, endDate]);

  return filteredMessages;
}
