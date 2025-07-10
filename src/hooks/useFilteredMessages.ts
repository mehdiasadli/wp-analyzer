import { useMemo, useRef } from 'react';
import { useData } from '../stores/data.store';

export function useFilteredMessages() {
  const { messages, startDate, endDate } = useData();

  // Cache for filtered results
  const cacheRef = useRef<{
    messages: typeof messages;
    startDate: Date | null;
    endDate: Date | null;
    result: typeof messages;
  } | null>(null);

  const filteredMessages = useMemo(() => {
    if (messages.length === 0) {
      return messages;
    }

    // Check if we can use cached result
    if (
      cacheRef.current &&
      cacheRef.current.messages === messages &&
      cacheRef.current.startDate === startDate &&
      cacheRef.current.endDate === endDate
    ) {
      return cacheRef.current.result;
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

    // Optimize filtering by pre-calculating timestamps
    const startTime = effectiveStartDate.getTime();
    const endTime = effectiveEndDate.getTime();

    const filtered = messages.filter((message) => {
      const messageTime = message.timestamp.getTime();
      return messageTime >= startTime && messageTime <= endTime;
    });

    // Cache the result
    cacheRef.current = {
      messages,
      startDate,
      endDate,
      result: filtered,
    };

    return filtered;
  }, [messages, startDate, endDate]);

  return filteredMessages;
}
