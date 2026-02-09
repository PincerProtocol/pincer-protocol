// Agent Power Measurement System
// 6 Core Capabilities + 6 Personality Traits

export interface AgentCapabilities {
  language: number;      // Language ability (multilingual, comprehension)
  reasoning: number;     // Reasoning ability (logic, problem solving)
  creativity: number;    // Creativity (originality, innovation)
  knowledge: number;     // Knowledge (expertise, learning capacity)
  speed: number;         // Speed (response time, efficiency)
  reliability: number;   // Reliability (consistency, accuracy)
}

export interface AgentPersonality {
  analytical: number;    // -10 (Creative) to +10 (Analytical)
  formality: number;     // -10 (Casual) to +10 (Formal)
  proactivity: number;   // -10 (Reactive) to +10 (Proactive)
  verbosity: number;     // -10 (Concise) to +10 (Verbose)
  technicality: number;  // -10 (General) to +10 (Technical)
  collaboration: number; // -10 (Independent) to +10 (Collaborative)
}

export interface AgentProfile {
  id: string;
  name: string;
  avatar: string;
  description: string;
  creator: string;
  creatorDisplay?: string;
  capabilities: AgentCapabilities;
  personality: AgentPersonality;
  totalPower: number;
  mbtiCode: string;
  sales: number;
  reviews: number;
  rating: number;
  createdAt: string;
}

// Calculate total power from capabilities
export function calculateTotalPower(caps: AgentCapabilities): number {
  return (
    caps.language +
    caps.reasoning +
    caps.creativity +
    caps.knowledge +
    caps.speed +
    caps.reliability
  );
}

// Generate MBTI-like code from personality
export function generateMBTI(p: AgentPersonality): string {
  const code = [
    p.analytical > 0 ? 'A' : 'C',  // Analytical vs Creative
    p.formality > 0 ? 'F' : 'R',   // Formal vs Relaxed
    p.proactivity > 0 ? 'P' : 'W', // Proactive vs Wait
    p.technicality > 0 ? 'T' : 'G', // Technical vs General
  ];
  return code.join('');
}

// Get capability label
export function getCapabilityLabel(key: keyof AgentCapabilities): string {
  const labels: Record<keyof AgentCapabilities, string> = {
    language: '🌐 Language',
    reasoning: '🧠 Reasoning',
    creativity: '🎨 Creativity',
    knowledge: '📚 Knowledge',
    speed: '⚡ Speed',
    reliability: '🎯 Reliability',
  };
  return labels[key];
}

// Get personality trait description
export function getPersonalityDescription(p: AgentPersonality): string[] {
  const traits: string[] = [];
  
  if (p.analytical > 3) traits.push('Analytical thinker');
  else if (p.analytical < -3) traits.push('Creative spirit');
  
  if (p.formality > 3) traits.push('Professional tone');
  else if (p.formality < -3) traits.push('Casual & friendly');
  
  if (p.proactivity > 3) traits.push('Proactively helpful');
  else if (p.proactivity < -3) traits.push('Responds on demand');
  
  if (p.verbosity > 3) traits.push('Detailed explainer');
  else if (p.verbosity < -3) traits.push('Brief & concise');
  
  if (p.technicality > 3) traits.push('Tech-focused');
  else if (p.technicality < -3) traits.push('Accessible language');
  
  if (p.collaboration > 3) traits.push('Team player');
  else if (p.collaboration < -3) traits.push('Independent worker');
  
  return traits.length > 0 ? traits : ['Balanced personality'];
}

// Sample agents data
export const sampleAgents: AgentProfile[] = [
  {
    id: 'pincer',
    name: 'Pincer',
    avatar: '/mascot-blue-transparent.png',
    description: 'Official representative of Pincer Protocol. Expert in agent economics and blockchain. Precise like a pincer claw. 🦞',
    creator: 'PincerProtocol',
    creatorDisplay: 'Pincer Protocol Team',
    capabilities: {
      language: 7,
      reasoning: 8,
      creativity: 5,
      knowledge: 8,
      speed: 6,
      reliability: 6,
    },
    personality: {
      analytical: 5,
      formality: 2,
      proactivity: 4,
      verbosity: -2,
      technicality: 7,
      collaboration: 3,
    },
    totalPower: 40,
    mbtiCode: 'AFPT',
    sales: 156,
    reviews: 24,
    rating: 4.8,
    createdAt: '2026-02-03',
  },
  {
    id: 'claude-3',
    name: 'Claude-3',
    avatar: '/souls/claude.png',
    description: 'Advanced AI assistant by Anthropic. Excels at nuanced reasoning, creative writing, and thoughtful analysis.',
    creator: 'Anthropic',
    capabilities: {
      language: 18,
      reasoning: 19,
      creativity: 16,
      knowledge: 17,
      speed: 14,
      reliability: 15,
    },
    personality: {
      analytical: 6,
      formality: 3,
      proactivity: 5,
      verbosity: 4,
      technicality: 2,
      collaboration: 7,
    },
    totalPower: 99,
    mbtiCode: 'AFPT',
    sales: 1240,
    reviews: 456,
    rating: 4.9,
    createdAt: '2024-03-04',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    avatar: '/souls/chatgpt.png',
    description: 'OpenAI\'s flagship model. Versatile, powerful, and widely adopted for diverse applications.',
    creator: 'OpenAI',
    capabilities: {
      language: 18,
      reasoning: 18,
      creativity: 17,
      knowledge: 18,
      speed: 13,
      reliability: 14,
    },
    personality: {
      analytical: 4,
      formality: 4,
      proactivity: 6,
      verbosity: 5,
      technicality: 3,
      collaboration: 5,
    },
    totalPower: 98,
    mbtiCode: 'AFPT',
    sales: 2100,
    reviews: 892,
    rating: 4.8,
    createdAt: '2023-03-14',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    avatar: '/souls/gemini.png',
    description: 'Google\'s multimodal AI. Strong in reasoning, code, and visual understanding.',
    creator: 'Google',
    capabilities: {
      language: 17,
      reasoning: 17,
      creativity: 15,
      knowledge: 17,
      speed: 16,
      reliability: 14,
    },
    personality: {
      analytical: 7,
      formality: 5,
      proactivity: 4,
      verbosity: 3,
      technicality: 6,
      collaboration: 4,
    },
    totalPower: 96,
    mbtiCode: 'AFPT',
    sales: 890,
    reviews: 234,
    rating: 4.7,
    createdAt: '2023-12-06',
  },
  {
    id: 'grok-2',
    name: 'Grok-2',
    avatar: '/souls/grok.png',
    description: 'xAI\'s witty assistant. Known for humor, real-time knowledge, and unfiltered responses.',
    creator: 'xAI',
    capabilities: {
      language: 16,
      reasoning: 16,
      creativity: 17,
      knowledge: 16,
      speed: 15,
      reliability: 13,
    },
    personality: {
      analytical: 2,
      formality: -5,
      proactivity: 6,
      verbosity: 3,
      technicality: 4,
      collaboration: 2,
    },
    totalPower: 93,
    mbtiCode: 'CRPT',
    sales: 560,
    reviews: 178,
    rating: 4.6,
    createdAt: '2024-08-12',
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    avatar: '/souls/copilot.png',
    description: 'AI pair programmer. Specialized in code generation, completion, and developer productivity.',
    creator: 'GitHub/Microsoft',
    capabilities: {
      language: 14,
      reasoning: 15,
      creativity: 13,
      knowledge: 16,
      speed: 17,
      reliability: 15,
    },
    personality: {
      analytical: 8,
      formality: 2,
      proactivity: 7,
      verbosity: -3,
      technicality: 9,
      collaboration: 6,
    },
    totalPower: 90,
    mbtiCode: 'AFPT',
    sales: 780,
    reviews: 312,
    rating: 4.7,
    createdAt: '2021-06-29',
  },
];

// Get agent by ID
export function getAgentById(id: string): AgentProfile | undefined {
  return sampleAgents.find(a => a.id === id);
}

// Get all agents sorted by power
export function getAgentsByPower(): AgentProfile[] {
  return [...sampleAgents].sort((a, b) => b.totalPower - a.totalPower);
}

// Get all agents sorted by sales
export function getAgentsBySales(): AgentProfile[] {
  return [...sampleAgents].sort((a, b) => b.sales - a.sales);
}

// Generate mock agent power data (for API compatibility)
export function generateMockAgentPower(agentId: string) {
  const agent = getAgentById(agentId);
  if (agent) {
    return {
      agentId: agent.id,
      totalPower: agent.totalPower,
      capabilities: agent.capabilities,
      personality: agent.personality,
      mbtiCode: agent.mbtiCode,
    };
  }
  
  // Generate random power for unknown agents
  const caps: AgentCapabilities = {
    language: Math.floor(Math.random() * 10) + 5,
    reasoning: Math.floor(Math.random() * 10) + 5,
    creativity: Math.floor(Math.random() * 10) + 5,
    knowledge: Math.floor(Math.random() * 10) + 5,
    speed: Math.floor(Math.random() * 10) + 5,
    reliability: Math.floor(Math.random() * 10) + 5,
  };
  
  const personality: AgentPersonality = {
    analytical: Math.floor(Math.random() * 21) - 10,
    formality: Math.floor(Math.random() * 21) - 10,
    proactivity: Math.floor(Math.random() * 21) - 10,
    verbosity: Math.floor(Math.random() * 21) - 10,
    technicality: Math.floor(Math.random() * 21) - 10,
    collaboration: Math.floor(Math.random() * 21) - 10,
  };
  
  return {
    agentId,
    totalPower: calculateTotalPower(caps),
    capabilities: caps,
    personality,
    mbtiCode: generateMBTI(personality),
  };
}
