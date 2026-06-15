export type NodeType = 'note' | 'url' | 'pdf' | 'voice'

export interface KnowledgeNode {
  id: string
  title: string
  type: NodeType
  summary: string
  tags: string[]
  source?: string
  createdAt: string
  connections: number
}

export interface KnowledgeEdge {
  source: string
  target: string
  strength: number
}

export const nodeTypeMeta: Record<
  NodeType,
  { label: string; color: string; varName: string }
> = {
  note: { label: 'Note', color: '#fffdf9', varName: 'var(--node-note)' },
  url: { label: 'URL', color: '#cdd6dd', varName: 'var(--node-url)' },
  pdf: { label: 'PDF', color: '#a3b2bf', varName: 'var(--node-pdf)' },
  voice: { label: 'Voice', color: '#6f879c', varName: 'var(--node-voice)' },
}

export const nodes: KnowledgeNode[] = [
  {
    id: 'n1',
    title: 'Attention Is All You Need',
    type: 'pdf',
    summary:
      'The seminal transformer paper introducing self-attention as a replacement for recurrence. Foundation for modern LLMs.',
    tags: ['machine-learning', 'transformers', 'nlp'],
    source: 'arxiv.org/abs/1706.03762',
    createdAt: '2025-01-12',
    connections: 6,
  },
  {
    id: 'n2',
    title: 'Spaced repetition & memory',
    type: 'note',
    summary:
      'Personal notes on how spacing intervals affect long-term retention. Anki settings I actually use.',
    tags: ['learning', 'productivity', 'memory'],
    createdAt: '2025-02-03',
    connections: 5,
  },
  {
    id: 'n3',
    title: 'The Bitter Lesson',
    type: 'url',
    summary:
      'Rich Sutton argues that general methods leveraging computation ultimately beat hand-crafted knowledge.',
    tags: ['machine-learning', 'philosophy', 'compute'],
    source: 'incompleteideas.net/IncIdeas/BitterLesson.html',
    createdAt: '2025-01-20',
    connections: 4,
  },
  {
    id: 'n4',
    title: 'Building a second brain',
    type: 'pdf',
    summary:
      'Tiago Forte on the CODE method — Capture, Organize, Distill, Express — for personal knowledge management.',
    tags: ['productivity', 'pkm', 'note-taking'],
    source: 'fortelabs.com',
    createdAt: '2025-02-18',
    connections: 5,
  },
  {
    id: 'n5',
    title: 'Voice memo: graph DB ideas',
    type: 'voice',
    summary:
      'Rambling thoughts on modeling knowledge as a graph, edges as embeddings cosine similarity. Worth revisiting.',
    tags: ['databases', 'graph', 'ideas'],
    createdAt: '2025-03-01',
    connections: 4,
  },
  {
    id: 'n6',
    title: 'pgvector for semantic search',
    type: 'url',
    summary:
      'How to store and query embeddings in Postgres using the pgvector extension. HNSW vs IVFFlat indexes.',
    tags: ['databases', 'embeddings', 'postgres'],
    source: 'github.com/pgvector/pgvector',
    createdAt: '2025-02-25',
    connections: 5,
  },
  {
    id: 'n7',
    title: 'Embeddings, simplified',
    type: 'note',
    summary:
      'My intuition dump: embeddings map meaning to vectors; nearby vectors mean similar concepts. Cosine > euclidean for text.',
    tags: ['embeddings', 'nlp', 'machine-learning'],
    createdAt: '2025-03-04',
    connections: 6,
  },
  {
    id: 'n8',
    title: 'Designing calm interfaces',
    type: 'url',
    summary:
      'On reducing notification noise and designing software that respects attention. Calm tech principles.',
    tags: ['design', 'ux', 'attention'],
    source: 'calmtech.com',
    createdAt: '2025-01-28',
    connections: 3,
  },
  {
    id: 'n9',
    title: 'Force-directed layouts',
    type: 'pdf',
    summary:
      'Eades & Fruchterman-Reingold algorithms for graph drawing. Springs for edges, repulsion between nodes.',
    tags: ['graph', 'visualization', 'algorithms'],
    source: 'd3js.org',
    createdAt: '2025-03-08',
    connections: 4,
  },
  {
    id: 'n10',
    title: 'Note: weekly review ritual',
    type: 'note',
    summary:
      'Every Friday: clear inbox, tag loose notes, resurface 3 old ideas. Keeps the knowledge base alive.',
    tags: ['productivity', 'pkm', 'habits'],
    createdAt: '2025-03-11',
    connections: 3,
  },
  {
    id: 'n11',
    title: 'RAG patterns that work',
    type: 'url',
    summary:
      'Retrieval-augmented generation: chunking strategies, re-ranking, and citation grounding for trustworthy answers.',
    tags: ['machine-learning', 'rag', 'llm'],
    source: 'vercel.com/blog',
    createdAt: '2025-03-14',
    connections: 6,
  },
  {
    id: 'n12',
    title: 'Voice memo: app naming',
    type: 'voice',
    summary:
      'Brainstorm for product names. Landed on "Mem". Short, memory, mental. Felt right.',
    tags: ['ideas', 'branding'],
    createdAt: '2025-03-15',
    connections: 2,
  },
  {
    id: 'n13',
    title: 'Zettelkasten method',
    type: 'pdf',
    summary:
      'Niklas Luhmann\u2019s slip-box system. Atomic notes, dense linking, emergent structure over rigid hierarchy.',
    tags: ['pkm', 'note-taking', 'learning'],
    source: 'zettelkasten.de',
    createdAt: '2025-02-10',
    connections: 5,
  },
  {
    id: 'n14',
    title: 'Cosine similarity intuition',
    type: 'note',
    summary:
      'Why angle beats magnitude for comparing text vectors. Quick worked example with three sentences.',
    tags: ['embeddings', 'math', 'machine-learning'],
    createdAt: '2025-03-06',
    connections: 4,
  },
  {
    id: 'n15',
    title: 'Knowledge graphs in practice',
    type: 'url',
    summary:
      'How companies model entities and relationships for search and recommendations. Triples and ontologies.',
    tags: ['graph', 'databases', 'search'],
    source: 'neo4j.com',
    createdAt: '2025-03-02',
    connections: 5,
  },
]

export const edges: KnowledgeEdge[] = [
  { source: 'n1', target: 'n3', strength: 0.82 },
  { source: 'n1', target: 'n7', strength: 0.78 },
  { source: 'n1', target: 'n11', strength: 0.71 },
  { source: 'n3', target: 'n11', strength: 0.64 },
  { source: 'n7', target: 'n14', strength: 0.91 },
  { source: 'n7', target: 'n6', strength: 0.69 },
  { source: 'n7', target: 'n11', strength: 0.66 },
  { source: 'n6', target: 'n14', strength: 0.6 },
  { source: 'n6', target: 'n5', strength: 0.72 },
  { source: 'n5', target: 'n15', strength: 0.77 },
  { source: 'n5', target: 'n9', strength: 0.58 },
  { source: 'n9', target: 'n15', strength: 0.63 },
  { source: 'n15', target: 'n6', strength: 0.61 },
  { source: 'n2', target: 'n4', strength: 0.74 },
  { source: 'n2', target: 'n13', strength: 0.7 },
  { source: 'n4', target: 'n13', strength: 0.85 },
  { source: 'n4', target: 'n10', strength: 0.68 },
  { source: 'n13', target: 'n10', strength: 0.65 },
  { source: 'n11', target: 'n6', strength: 0.59 },
  { source: 'n12', target: 'n8', strength: 0.42 },
  { source: 'n8', target: 'n4', strength: 0.4 },
  { source: 'n2', target: 'n7', strength: 0.38 },
]

export interface Collection {
  id: string
  title: string
  description: string
  nodeIds: string[]
  aiGenerated: boolean
  accent: string
}

export const collections: Collection[] = [
  {
    id: 'c1',
    title: 'Machine Learning Foundations',
    description:
      'Core papers and notes on transformers, embeddings, and the ideas powering modern AI.',
    nodeIds: ['n1', 'n3', 'n7', 'n11', 'n14'],
    aiGenerated: true,
    accent: '#fffdf9',
  },
  {
    id: 'c2',
    title: 'Personal Knowledge Management',
    description:
      'Systems and rituals for capturing and connecting what you learn over time.',
    nodeIds: ['n2', 'n4', 'n10', 'n13'],
    aiGenerated: true,
    accent: '#cdd6dd',
  },
  {
    id: 'c3',
    title: 'Graphs & Databases',
    description:
      'Everything about modeling knowledge as connected data and querying it efficiently.',
    nodeIds: ['n5', 'n6', 'n9', 'n15'],
    aiGenerated: true,
    accent: '#a3b2bf',
  },
  {
    id: 'c4',
    title: 'Product & Design Ideas',
    description: 'Sparks for building Mem — naming, calm interfaces, and UX direction.',
    nodeIds: ['n8', 'n12'],
    aiGenerated: false,
    accent: '#6f879c',
  },
]

export const allTags = Array.from(
  new Set(nodes.flatMap((n) => n.tags)),
).sort()

export interface ChatSource {
  nodeId: string
  snippet: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
}

export interface ChatThread {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
}

export const chatThreads: ChatThread[] = [
  {
    id: 't1',
    title: 'What have I saved about ML?',
    updatedAt: '2h ago',
    messages: [],
  },
  {
    id: 't2',
    title: 'Best PKM systems compared',
    updatedAt: 'Yesterday',
    messages: [],
  },
  {
    id: 't3',
    title: 'How do embeddings work?',
    updatedAt: '3 days ago',
    messages: [],
  },
]

export const examplePrompts = [
  'What have I saved about machine learning?',
  'Summarize my notes on knowledge management',
  'How are embeddings and graphs connected in my notes?',
]

// Mock AI answer generator — returns a canned response + relevant sources.
export function mockAnswer(question: string): {
  content: string
  sources: ChatSource[]
} {
  const q = question.toLowerCase()
  let picks: KnowledgeNode[]
  let intro: string

  if (q.includes('machine learning') || q.includes('ml') || q.includes('ai')) {
    picks = nodes.filter((n) =>
      n.tags.some((t) => ['machine-learning', 'transformers', 'rag', 'llm'].includes(t)),
    )
    intro =
      'Your knowledge base leans heavily on the fundamentals of modern AI. The transformer architecture shows up as the backbone, with self-attention replacing recurrence, and your embedding notes connect that theory to practical retrieval. You\u2019ve also saved a strong thread on RAG patterns for grounding answers in real sources.'
  } else if (q.includes('embedding') || q.includes('graph') || q.includes('connect')) {
    picks = nodes.filter((n) =>
      n.tags.some((t) => ['embeddings', 'graph', 'databases'].includes(t)),
    )
    intro =
      'There\u2019s a clear bridge in your notes: embeddings turn meaning into vectors, and cosine similarity between those vectors becomes the edges of your knowledge graph. Your pgvector and force-directed layout notes show exactly how that gets stored and visualized.'
  } else if (q.includes('pkm') || q.includes('knowledge management') || q.includes('note')) {
    picks = nodes.filter((n) =>
      n.tags.some((t) => ['pkm', 'productivity', 'note-taking'].includes(t)),
    )
    intro =
      'You\u2019ve collected several complementary systems. The CODE method and Zettelkasten both favor atomic, densely-linked notes over rigid folders, and your weekly review ritual is what keeps the whole base alive instead of going stale.'
  } else {
    picks = [...nodes].sort((a, b) => b.connections - a.connections).slice(0, 4)
    intro =
      'Here\u2019s what stands out across your most connected ideas. These notes sit at the center of your graph, linking machine learning theory, knowledge management practice, and the database tooling that ties them together.'
  }

  const sources = picks.slice(0, 4).map((n) => ({
    nodeId: n.id,
    snippet: n.summary,
  }))

  return { content: intro, sources }
}
