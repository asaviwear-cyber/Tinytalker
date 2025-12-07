import { LearningItem } from './types';

export const COLORS = {
  red: 'bg-kidRed',
  blue: 'bg-kidBlue',
  green: 'bg-kidGreen',
  yellow: 'bg-kidYellow',
  purple: 'bg-kidPurple',
  orange: 'bg-kidOrange',
};

const COLOR_ARRAY = Object.values(COLORS);

// Helper to cycle colors
const getColor = (index: number) => COLOR_ARRAY[index % COLOR_ARRAY.length];

const LETTER_DATA = [
  { char: 'A', word: 'Apple', emoji: '🍎' },
  { char: 'B', word: 'Ball', emoji: '⚽' },
  { char: 'C', word: 'Cat', emoji: '🐱' },
  { char: 'D', word: 'Dog', emoji: '🐶' },
  { char: 'E', word: 'Elephant', emoji: '🐘' },
  { char: 'F', word: 'Fish', emoji: '🐟' },
  { char: 'G', word: 'Guitar', emoji: '🎸' },
  { char: 'H', word: 'House', emoji: '🏠' },
  { char: 'I', word: 'Ice Cream', emoji: '🍦' },
  { char: 'J', word: 'Juice', emoji: '🧃' },
  { char: 'K', word: 'Kite', emoji: '🪁' },
  { char: 'L', word: 'Lion', emoji: '🦁' },
  { char: 'M', word: 'Monkey', emoji: '🐵' },
  { char: 'N', word: 'Nest', emoji: '🪺' },
  { char: 'O', word: 'Orange', emoji: '🍊' },
  { char: 'P', word: 'Pig', emoji: '🐷' },
  { char: 'Q', word: 'Queen', emoji: '👑' },
  { char: 'R', word: 'Rabbit', emoji: '🐰' },
  { char: 'S', word: 'Sun', emoji: '☀️' },
  { char: 'T', word: 'Tiger', emoji: '🐯' },
  { char: 'U', word: 'Umbrella', emoji: '☔' },
  { char: 'V', word: 'Violin', emoji: '🎻' },
  { char: 'W', word: 'Whale', emoji: '🐳' },
  { char: 'X', word: 'X-ray', emoji: '🩻' },
  { char: 'Y', word: 'Yo-yo', emoji: '🪀' },
  { char: 'Z', word: 'Zebra', emoji: '🦓' },
];

export const LETTERS: LearningItem[] = LETTER_DATA.map((data, i) => {
  return {
    id: `letter-${data.char}`,
    char: data.char,
    type: 'letter',
    color: getColor(i),
    word: data.word,
    emoji: data.emoji,
    pronunciation: [data.char, data.char.toLowerCase()]
  };
});

// Add specific phonetic variations for tricky letters
const phoneticOverrides: Record<string, string[]> = {
  'A': ['a', 'ay', 'hey', 'eh'],
  'B': ['b', 'bee', 'be'],
  'C': ['c', 'see', 'sea'],
  'D': ['d', 'dee'],
  'E': ['e', 'ee'],
  'F': ['f', 'eff'],
  'G': ['g', 'jee', 'gee'],
  'H': ['h', 'etch', 'aitch'],
  'I': ['i', 'eye', 'aye'],
  'J': ['j', 'jay'],
  'K': ['k', 'kay'],
  'L': ['l', 'el'],
  'M': ['m', 'em'],
  'N': ['n', 'en'],
  'O': ['o', 'oh'],
  'P': ['p', 'pee', 'pea'],
  'Q': ['q', 'cue', 'que'],
  'R': ['r', 'are', 'ar'],
  'S': ['s', 'ess'],
  'T': ['t', 'tee', 'tea'],
  'U': ['u', 'you'],
  'V': ['v', 'vee'],
  'W': ['w', 'double you', 'double u'],
  'X': ['x', 'ex'],
  'Y': ['y', 'why'],
  'Z': ['z', 'zee', 'zed']
};

LETTERS.forEach(l => {
  if (phoneticOverrides[l.char]) {
    l.pronunciation = [...l.pronunciation, ...phoneticOverrides[l.char]];
  }
});

export const NUMBERS: LearningItem[] = Array.from({ length: 10 }, (_, i) => {
  const num = i.toString();
  return {
    id: `number-${num}`,
    char: num,
    type: 'number',
    color: getColor(i + 26), // Offset colors
    pronunciation: [num]
  };
});

// Add specific phonetic variations for numbers
const numberOverrides: Record<string, string[]> = {
  '0': ['zero', 'oh', 'nought'],
  '1': ['one', 'won'],
  '2': ['two', 'to', 'too'],
  '3': ['three', 'tree'],
  '4': ['four', 'for'],
  '5': ['five'],
  '6': ['six'],
  '7': ['seven'],
  '8': ['eight', 'ate'],
  '9': ['nine']
};

NUMBERS.forEach(n => {
  if (numberOverrides[n.char]) {
    n.pronunciation = [...n.pronunciation, ...numberOverrides[n.char]];
  }
});

export const ALL_ITEMS = [...LETTERS, ...NUMBERS];