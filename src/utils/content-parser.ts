import type { MessageInfo } from './message-parser';

export type ContentType =
  | 'text'
  | 'image'
  | 'video'
  | 'video note'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'contact'
  | 'gif'
  | 'call'
  | 'poll';
export type MessageStatus = 'deleted' | 'edited' | 'active';
export type PollInfo = {
  question: string;
  options: { option: string; votes: number }[];
};
export type CallInfo = {
  type: 'voice' | 'video';
  missed: boolean | null; // nullable, because some calls don't have a missed information
  joined: number | null; // nullable, because some calls don't have a joined information
  duration: number | null; // nullable, because some calls don't have a duration information
};

export type ContentInfo = {
  type: ContentType;
  content: string | null;
  status: MessageStatus;
  call: CallInfo | null;
  poll: PollInfo | null;
  mentions: string[];
};

// Pre-compile regex patterns for better performance
const SYSTEM_REGEXES = [/^.+ (?:deleted|changed|removed|added) .+$/, /^.* left$/, /.+ joined using your invite$/];

const TYPE_REGEXES: { type: ContentType; regex: RegExp }[] = [
  {
    type: 'image',
    regex: /image omitted$/,
  },
  {
    type: 'video',
    regex: /video omitted$/,
  },
  {
    type: 'video note',
    regex: /video note omitted$/,
  },
  {
    type: 'audio',
    regex: /audio omitted$/,
  },
  {
    type: 'document',
    regex: /document omitted$/,
  },
  {
    type: 'sticker',
    regex: /^sticker omitted$/,
  },
  {
    type: 'contact',
    regex: /Contact card omitted$/,
  },
  {
    type: 'gif',
    regex: /GIF omitted$/,
  },
  {
    type: 'poll',
    regex: /^POLL:/,
  },
];

const STATUS_REGEXES = {
  deleted: /This message was deleted\.$/,
  deletedAsAdmin: /You deleted this message as admin\.$/,
  edited: / <This message was edited>$/,
};

const CALL_REGEXES = {
  missedVideoCall: /Missed video call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  missedVoiceCall: /Missed voice call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  videoCall: /Video call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  voiceCall: /Call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  voiceCall_2: /Voice call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  startedVideoCall: /.+ started a video call$/,
  startedVoiceCall: /.+ started a call$/,
};

export function parseContent(message: MessageInfo): ContentInfo | null {
  const { content } = message;

  // Early return for system messages
  if (SYSTEM_REGEXES.some((r) => r.test(content))) {
    return null;
  }

  let messageContent: null | string = content;
  let type: ContentType | null = null;

  // Check content type first
  for (const regex of TYPE_REGEXES) {
    if (regex.regex.test(content)) {
      type = regex.type;
      messageContent = null;
      break;
    }
  }

  if (type === null) {
    type = 'text';
  }

  const { status, content: statusContent } = getMessageStatus(messageContent);
  const callInfo = getCallInfo(statusContent);

  if (callInfo !== null) {
    type = 'call';
  }

  // Handle poll parsing
  const pollInfo = type === 'poll' ? parsePoll(content) : null;
  const mentions = detectMentions(statusContent);

  return {
    type,
    call: callInfo,
    content: callInfo === null ? statusContent : null,
    status,
    poll: pollInfo,
    mentions,
  };
}

export function getMessageStatus(content: string | null): { status: MessageStatus; content: string | null } {
  if (content === null) return { status: 'active', content: null };

  if (STATUS_REGEXES.deleted.test(content)) {
    return {
      status: 'deleted',
      content: null,
    };
  }

  if (STATUS_REGEXES.deletedAsAdmin.test(content)) {
    return {
      status: 'deleted',
      content: null,
    };
  }

  if (STATUS_REGEXES.edited.test(content)) {
    return {
      status: 'edited',
      content: content.replace(STATUS_REGEXES.edited, '').trim(),
    };
  }

  return {
    status: 'active',
    content,
  };
}

export function getCallInfo(content: string | null): CallInfo | null {
  if (content === null) return null;

  function respond(info: Partial<Omit<CallInfo, 'type'>> & { type: CallInfo['type'] }) {
    return {
      type: info.type,
      missed: info.missed ?? null,
      joined: info.joined ?? null,
      duration: info.duration ?? null,
    };
  }

  // first, check the started calls, since they do not have other information
  if (CALL_REGEXES.startedVideoCall.test(content)) {
    return respond({ type: 'video' });
  }

  if (CALL_REGEXES.startedVoiceCall.test(content)) {
    return respond({ type: 'voice' });
  }

  // check the missed calls
  const infoCheckRegex = /(\d+) (sec|min|hr) • (\d+) joined/;

  const infoCheckResult = content.match(infoCheckRegex);
  const [, duration, durationUnit, joined] = infoCheckResult ?? [];
  const info = {
    joined: Number(joined) || null,
    duration:
      durationUnit === 'sec'
        ? Number(duration)
        : durationUnit === 'min'
          ? Number(duration) * 60
          : Number(duration) * 3600,
  };

  if (CALL_REGEXES.missedVideoCall.test(content)) {
    return respond({ type: 'video', missed: true, ...info });
  }

  if (CALL_REGEXES.missedVoiceCall.test(content)) {
    return respond({ type: 'voice', missed: true, ...info });
  }

  if (CALL_REGEXES.videoCall.test(content)) {
    return respond({ type: 'video', missed: false, ...info });
  }

  if (CALL_REGEXES.voiceCall.test(content)) {
    return respond({ type: 'voice', missed: false, ...info });
  }

  if (CALL_REGEXES.voiceCall_2.test(content)) {
    return respond({ type: 'voice', missed: false, ...info });
  }

  return null;
}

function parsePoll(content: string | null): PollInfo | null {
  if (content === null) return null;

  // Debug logging to see the actual content
  console.log('Parsing poll content:', content);

  // Check if content starts with POLL:
  if (!content.startsWith('POLL:')) {
    console.log('Content does not start with POLL:');
    return null;
  }

  // Extract the question - everything after POLL: until the first OPTION:
  const questionMatch = content.match(/POLL:\s*\n?([^\n]+)/);
  if (!questionMatch || !questionMatch[1]) {
    console.log('Could not extract question');
    return null;
  }

  const question = questionMatch[1].trim();
  const options: { option: string; votes: number }[] = [];

  // Extract all options using a more flexible pattern
  const optionPattern = /OPTION:\s*([^(]+?)\s*\((\d+)\s*votes?\)/g;
  let optionMatch;

  while ((optionMatch = optionPattern.exec(content)) !== null) {
    if (optionMatch[1] && optionMatch[2]) {
      options.push({
        option: optionMatch[1].trim(),
        votes: parseInt(optionMatch[2]),
      });
    }
  }

  console.log('Parsed poll:', { question, options });

  // Return null if no options found
  if (options.length === 0) {
    console.log('No options found in poll');
    return null;
  }

  return {
    question: question.trim(),
    options,
  };
}

function detectMentions(content: string | null): string[] {
  if (content === null) return [];

  // Simple mention detection - can be enhanced based on your needs
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match[1]) {
      mentions.push(match[1]);
    }
  }

  return mentions;
}
