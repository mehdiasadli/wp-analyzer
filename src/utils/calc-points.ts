import type { Message } from './data';

// Point system configuration
const POINTS_CONFIG = {
  // Base points for each message type
  base: {
    text: 1.0,
    image: 2.0,
    video: 2.5,
    audio: 1.75,
    document: 2.0,
    sticker: 1.0,
    contact: 0.5,
    gif: 1.0,
    call: 1.0,
    poll: 2.0,
    'video note': 2.0,
  },

  // Text message points per character (capped)
  textPerChar: 0.01,
  textMaxChars: 500, // Max characters to count for points

  // Poll points per option and per character in question
  pollPerOption: 0.3,
  pollPerChar: 0.005,
  pollMaxChars: 200,

  // Call points based on duration and participants
  callPerMinute: 0.5,
  callPerParticipant: 0.2,
  callMissedPenalty: -0.5,

  // Content length bonuses (for any message with content)
  contentPerChar: 0.002,
  contentMaxChars: 300,

  // Status modifiers
  status: {
    active: 1.0,
    edited: 1.1, // Slightly more points for edited messages (shows effort)
    deleted: -0.2,
  },

  // Limits
  minPoints: 0.5,
  maxPoints: 10.0,
};

// Helper function to clamp points between min and max
function clampPoints(points: number): number {
  return Math.max(POINTS_CONFIG.minPoints, Math.min(POINTS_CONFIG.maxPoints, points));
}

// Calculate text-based points
function calculateTextPoints(content: string | null): number {
  if (!content) return 0;

  const charCount = Math.min(content.length, POINTS_CONFIG.textMaxChars);
  return charCount * POINTS_CONFIG.textPerChar;
}

// Calculate poll points
function calculatePollPoints(poll: Message['message']['poll']): number {
  if (!poll) return 0;

  let points = 0;

  // Points for number of options
  const optionCount = poll.options?.length || 0;
  points += optionCount * POINTS_CONFIG.pollPerOption;

  // Points for question length
  if (poll.question) {
    const questionChars = Math.min(poll.question.length, POINTS_CONFIG.pollMaxChars);
    points += questionChars * POINTS_CONFIG.pollPerChar;
  }

  return points;
}

// Calculate call points
function calculateCallPoints(call: Message['message']['call']): number {
  if (!call) return 0;

  let points = 0;

  // Points for duration (in minutes)
  if (call.duration) {
    const durationMinutes = call.duration / 60;
    points += durationMinutes * POINTS_CONFIG.callPerMinute;
  }

  // Points for participants
  if (call.joined) {
    points += call.joined * POINTS_CONFIG.callPerParticipant;
  }

  // Penalty for missed calls
  if (call.missed) {
    points += POINTS_CONFIG.callMissedPenalty;
  }

  return points;
}

// Calculate content length bonus
function calculateContentBonus(content: string | null): number {
  if (!content) return 0;

  const charCount = Math.min(content.length, POINTS_CONFIG.contentMaxChars);
  return charCount * POINTS_CONFIG.contentPerChar;
}

// Main points calculation function
export function calcPoints(msg: Message): number {
  const message = msg.message;

  // Handle deleted messages
  if (message.status === 'deleted') {
    return POINTS_CONFIG.status.deleted;
  }

  // Get base points for message type
  const basePoints = POINTS_CONFIG.base[message.type] || 1.0;

  // Calculate additional points based on content
  let additionalPoints = 0;

  switch (message.type) {
    case 'text':
      // Text messages get points based on character count
      additionalPoints += calculateTextPoints(message.content);
      break;

    case 'poll':
      // Polls get points based on options and question length
      additionalPoints += calculatePollPoints(message.poll);
      break;

    case 'call':
      // Calls get points based on duration and participants
      additionalPoints += calculateCallPoints(message.call);
      break;

    default:
      // Other message types get content length bonus
      additionalPoints += calculateContentBonus(message.content);
      break;
  }

  // Apply status modifier
  const statusModifier = POINTS_CONFIG.status[message.status] || 1.0;

  // Calculate total points
  const totalPoints = (basePoints + additionalPoints) * statusModifier;

  // Clamp to min/max range
  return clampPoints(totalPoints);
}

// Export configuration for testing/debugging
export { POINTS_CONFIG };
