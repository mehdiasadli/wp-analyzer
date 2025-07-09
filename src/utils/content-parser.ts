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

const systemRegexes = [/^.+ (?:deleted|changed|removed|added) .+$/, /^.* left$/, /.+ joined using your invite$/];

const typeRegexes: { type: ContentType; regex: RegExp }[] = [
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

const statusRegexes = {
  deleted: /This message was deleted\.$/,
  deletedAsAdmin: /You deleted this message as admin\.$/,
  edited: / <This message was edited>$/,
};

const callRegexes = {
  missedVideoCall: /Missed video call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  missedVoiceCall: /Missed voice call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  videoCall: /Video call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  voiceCall: /Call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  voiceCall_2: /Voice call\. (\d+) (sec|min|hr) • (\d+) joined$/,
  startedVideoCall: /.+ started a video call$/,
  startedVoiceCall: /.+ started a call$/,
};

const pollRegex = /POLL:\s*\n([^\n]+)(?:\n(?:OPTION: ([^(]+) \((\d+) votes\))\s*)+/g;

export function parseContent(message: MessageInfo): ContentInfo | null {
  const { content } = message;

  if (systemRegexes.some((r) => r.test(content))) {
    return null;
  }

  let messageContent: null | string = content;
  let type: ContentType | null = null;

  for (const regex of typeRegexes) {
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

  if (statusRegexes.deleted.test(content)) {
    return {
      status: 'deleted',
      content: null,
    };
  }

  if (statusRegexes.deletedAsAdmin.test(content)) {
    return {
      status: 'deleted',
      content: null,
    };
  }

  if (statusRegexes.edited.test(content)) {
    return {
      status: 'edited',
      content: content.replace(statusRegexes.edited, '').trim(),
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
  if (callRegexes.startedVideoCall.test(content)) {
    return respond({ type: 'video' });
  }

  if (callRegexes.startedVoiceCall.test(content)) {
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

  if (callRegexes.missedVideoCall.test(content)) {
    return respond({ type: 'video', missed: true, ...info });
  }

  if (callRegexes.missedVoiceCall.test(content)) {
    return respond({ type: 'voice', missed: true, ...info });
  }

  // check the ended calls
  if (callRegexes.videoCall.test(content)) {
    return respond({ type: 'video', missed: false, ...info });
  }

  if (callRegexes.voiceCall.test(content)) {
    return respond({ type: 'voice', missed: false, ...info });
  }

  if (callRegexes.voiceCall_2.test(content)) {
    return respond({ type: 'voice', missed: false, ...info });
  }

  return null;
}

function parsePoll(content: string | null): PollInfo | null {
  if (content === null) return null;

  // Reset regex lastIndex to ensure it starts from the beginning
  pollRegex.lastIndex = 0;

  const match = pollRegex.exec(content);
  if (!match || !match[1]) return null;

  const question = match[1].trim();
  const options: { option: string; votes: number }[] = [];

  // Extract all options from the content
  const optionRegex = /‎?OPTION: ([^(]+) \((\d+) votes\)/g;
  let optionMatch;

  while ((optionMatch = optionRegex.exec(content)) !== null) {
    if (optionMatch[1] && optionMatch[2]) {
      options.push({
        option: optionMatch[1].trim(),
        votes: parseInt(optionMatch[2], 10),
      });
    }
  }

  return {
    question,
    options,
  };
}

const mobileNumberRegexes = [/@(994\d{9})/g, /@(79\d{9})/g, /@(48\d{9})/g, /@(39\d{10})/g, /@(36\d{9})/g];

function detectMentions(content: string | null): string[] {
  if (content === null) return [];

  const mentions: string[] = [];

  for (const regex of mobileNumberRegexes) {
    const matches = content.match(regex);

    if (matches) {
      const [, ...numbers] = matches;
      mentions.push(...numbers.map((n) => n.trim()));
    }
  }

  return mentions;
}
