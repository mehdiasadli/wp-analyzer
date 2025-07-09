import type { Message } from './data';
import type { ContentInfo, ContentType, MessageStatus } from './content-parser';

type FilterOperator<T> = {
  eq?: T;
  neq?: T;
  in?: T[];
  nin?: T[];
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
};

// Nested filter for ContentInfo
type ContentInfoFilter = {
  type?: FilterOperator<ContentType>;
  content?: FilterOperator<string | null>;
  status?: FilterOperator<MessageStatus>;
  mentions?: FilterOperator<string[]>;
  call?: {
    type?: FilterOperator<'voice' | 'video'>;
    missed?: FilterOperator<boolean | null>;
    joined?: FilterOperator<number | null>;
    duration?: FilterOperator<number | null>;
  } | null;
  poll?: {
    question?: FilterOperator<string>;
    options?: FilterOperator<{ option: string; votes: number }[]>;
  } | null;
};

// Main filter interface
type MessageFilter = {
  author?: FilterOperator<string>;
  timestamp?: FilterOperator<Date>;
  message?: ContentInfoFilter;
  AND?: MessageFilter[];
  OR?: MessageFilter[];
  NOT?: MessageFilter;
};

class Filter {
  constructor(private readonly data: Message[]) {}

  where(filter: MessageFilter): Message[] {
    return this.data.filter((message) => this.evaluateFilter(message, filter));
  }

  private evaluateFilter(message: Message, filter: MessageFilter): boolean {
    // Handle logical operators
    if (filter.AND) {
      return filter.AND.every((f) => this.evaluateFilter(message, f));
    }

    if (filter.OR) {
      return filter.OR.some((f) => this.evaluateFilter(message, f));
    }

    if (filter.NOT) {
      return !this.evaluateFilter(message, filter.NOT);
    }

    // Evaluate individual field filters
    if (filter.author && !this.evaluateFieldFilter(message.author, filter.author)) {
      return false;
    }

    if (filter.timestamp && !this.evaluateFieldFilter(message.timestamp, filter.timestamp)) {
      return false;
    }

    if (filter.message && !this.evaluateContentInfoFilter(message.message, filter.message)) {
      return false;
    }

    return true;
  }

  private evaluateFieldFilter<T>(value: T, filter: FilterOperator<T>): boolean {
    if (filter.eq !== undefined && value !== filter.eq) return false;
    if (filter.neq !== undefined && value === filter.neq) return false;

    if (filter.in !== undefined && !filter.in.includes(value)) return false;
    if (filter.nin !== undefined && filter.nin.includes(value)) return false;

    // Numeric and date comparisons
    if (typeof value === 'number' || value instanceof Date) {
      const numValue = value instanceof Date ? value.getTime() : value;

      if (filter.gt !== undefined) {
        const filterValue = filter.gt instanceof Date ? filter.gt.getTime() : filter.gt;
        if (typeof filterValue === 'number' && numValue <= filterValue) return false;
      }

      if (filter.gte !== undefined) {
        const filterValue = filter.gte instanceof Date ? filter.gte.getTime() : filter.gte;
        if (typeof filterValue === 'number' && numValue < filterValue) return false;
      }

      if (filter.lt !== undefined) {
        const filterValue = filter.lt instanceof Date ? filter.lt.getTime() : filter.lt;
        if (typeof filterValue === 'number' && numValue >= filterValue) return false;
      }

      if (filter.lte !== undefined) {
        const filterValue = filter.lte instanceof Date ? filter.lte.getTime() : filter.lte;
        if (typeof filterValue === 'number' && numValue > filterValue) return false;
      }
    }

    // String operations
    if (typeof value === 'string') {
      if (filter.contains !== undefined && !value.includes(filter.contains)) return false;
      if (filter.startsWith !== undefined && !value.startsWith(filter.startsWith)) return false;
      if (filter.endsWith !== undefined && !value.endsWith(filter.endsWith)) return false;
    }

    return true;
  }

  private evaluateContentInfoFilter(contentInfo: ContentInfo, filter: ContentInfoFilter): boolean {
    if (filter.type && !this.evaluateFieldFilter(contentInfo.type, filter.type)) return false;
    if (filter.content && !this.evaluateFieldFilter(contentInfo.content, filter.content)) return false;
    if (filter.status && !this.evaluateFieldFilter(contentInfo.status, filter.status)) return false;

    // Handle call filter
    if (filter.call !== undefined) {
      if (filter.call === null) {
        if (contentInfo.call !== null) return false;
      } else {
        if (contentInfo.call === null) return false;
        if (filter.call.type && !this.evaluateFieldFilter(contentInfo.call.type, filter.call.type)) return false;
        if (filter.call.missed && !this.evaluateFieldFilter(contentInfo.call.missed, filter.call.missed)) return false;
        if (filter.call.joined && !this.evaluateFieldFilter(contentInfo.call.joined, filter.call.joined)) return false;
        if (filter.call.duration && !this.evaluateFieldFilter(contentInfo.call.duration, filter.call.duration))
          return false;
      }
    }

    // Handle poll filter
    if (filter.poll !== undefined) {
      if (filter.poll === null) {
        if (contentInfo.poll !== null) return false;
      } else {
        if (contentInfo.poll === null) return false;
        if (filter.poll.question && !this.evaluateFieldFilter(contentInfo.poll.question, filter.poll.question))
          return false;
        if (filter.poll.options && !this.evaluateFieldFilter(contentInfo.poll.options, filter.poll.options))
          return false;
      }
    }

    // Handle mentions filter
    if (filter.mentions !== undefined) {
      if (!this.evaluateFieldFilter(contentInfo.mentions, filter.mentions)) return false;
    }

    return true;
  }

  // Convenience methods
  whereAuthor(author: string): Message[] {
    return this.where({ author: { eq: author } });
  }

  whereType(type: ContentType): Message[] {
    return this.where({ message: { type: { eq: type } } });
  }

  whereStatus(status: MessageStatus): Message[] {
    return this.where({ message: { status: { eq: status } } });
  }

  whereDateRange(start: Date, end: Date): Message[] {
    return this.where({
      timestamp: {
        gte: start,
        lte: end,
      },
    });
  }

  whereContentContains(text: string): Message[] {
    return this.where({ message: { content: { contains: text } } });
  }
}

export { Filter, type MessageFilter, type FilterOperator, type ContentInfoFilter };
