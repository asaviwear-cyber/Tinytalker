export interface LearningItem {
  id: string;
  char: string;
  type: 'letter' | 'number';
  pronunciation: string[]; // Variations for matching logic
  color: string;
  word?: string; // e.g. "A is for Apple"
  emoji?: string; // Visual representation
}

export enum AppMode {
  HOME = 'HOME',
  LEARN = 'LEARN',
  PRACTICE = 'PRACTICE',
  TIME_CHALLENGE = 'TIME_CHALLENGE'
}

export interface FeedbackState {
  isCorrect: boolean | null;
  message: string;
}