export interface EmojiReaction {
  emoji: string;
  author: 'ziji' | 'xu';
  timestamp: number;
}

export interface PaperCardData {
  id: string;
  text: string;
  author: 'ziji' | 'xu'; // Who created this card
  x: number; // World coordinates (not screen coordinates)
  y: number; // World coordinates (not screen coordinates)
  rotation: number;
  timestamp: number;
  dateKey: string; // YYYY-MM-DD format for grouping by day
  isTyping: boolean;
  width?: number; // Actual rendered width
  height?: number; // Actual rendered height
  replyTo?: string; // ID of the card this is replying to (creates a line connection)
  emojiReactions?: EmojiReaction[]; // Emoji reactions from both users
}

export enum TypewriterState {
  IDLE = 'IDLE',
  THINKING = 'THINKING', // AI processing
  PRINTING = 'PRINTING', // Animation onto card
}

export interface Coordinates {
  x: number;
  y: number;
}