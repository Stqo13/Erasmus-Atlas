export const TOPIC_COLORS: Record<string, string> = {
  Food: '#ef4444',
  Nightlife: '#a855f7',
  Housing: '#f59e0b',
  Academics: '#3b82f6',
  Safety: '#10b981',
  Costs: '#f97316',
  Travel: '#14b8a6',
}

export const DEFAULT_MARKER = '#2563eb'

export function topicColor(topic?: string): string {
  if (!topic) return DEFAULT_MARKER
  return TOPIC_COLORS[topic] ?? DEFAULT_MARKER
}

export function colorForTopics(topics?: string[] | null) {
  if (!topics || !topics.length) return DEFAULT_MARKER
  const firstTopic = topics[0]

  if (typeof firstTopic === 'string' && firstTopic in TOPIC_COLORS) {
    return TOPIC_COLORS[firstTopic]
  }

  return DEFAULT_MARKER
}
