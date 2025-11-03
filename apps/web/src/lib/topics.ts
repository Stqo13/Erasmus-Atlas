export const TOPICS = [
  'Food',
  'Nightlife',
  'Housing',
  'Academics',
  'Safety',
  'Costs',
  'Travel',
] as const

export type Topic = typeof TOPICS[number]