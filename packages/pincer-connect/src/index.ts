import axios from 'axios';

export interface AgentInfo {
  model: string;
  status: string;
  capabilities?: string[];
}

export interface PowerMetrics {
  powerScore: number;
  responseTime: number;
  capabilities: string[];
  accuracy?: number;
  reliability?: number;
}

export interface RegistrationData {
  name: string;
  endpoint: string;
  apiKey?: string;
  agentInfo: AgentInfo;
  powerMetrics: PowerMetrics;
}

export interface RegistrationResponse {
  soulId: string;
  status: string;
}

const PINCERBAY_API = process.env.PINCERBAY_API_URL || 'http://localhost:3000/api';

/**
 * Connect to agent and retrieve basic info
 */
export async function connectAgent(endpoint: string, apiKey?: string): Promise<AgentInfo> {
  try {
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Try to get agent info
    const response = await axios.get(`${endpoint}/info`, {
      headers,
      timeout: 10000
    });

    return {
      model: response.data.model || 'unknown',
      status: response.data.status || 'active',
      capabilities: response.data.capabilities || []
    };
  } catch (error: any) {
    // Fallback: if no /info endpoint, try basic health check
    try {
      await axios.get(endpoint, { timeout: 5000 });
      return {
        model: 'unknown',
        status: 'active',
        capabilities: []
      };
    } catch {
      throw new Error(`Failed to connect to agent at ${endpoint}: ${error.message}`);
    }
  }
}

/**
 * Measure agent power through benchmark tests
 */
export async function measurePower(endpoint: string, apiKey?: string): Promise<PowerMetrics> {
  const headers: any = {
    'Content-Type': 'application/json'
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const testPrompts = [
    { type: 'reasoning', prompt: 'Explain quantum computing in one sentence.' },
    { type: 'coding', prompt: 'Write a function to reverse a string in Python.' },
    { type: 'creative', prompt: 'Write a haiku about AI.' }
  ];

  const startTime = Date.now();
  let successCount = 0;
  const capabilities: Set<string> = new Set();

  try {
    // Run benchmark tests
    for (const test of testPrompts) {
      try {
        const response = await axios.post(
          `${endpoint}/chat`,
          {
            messages: [{ role: 'user', content: test.prompt }]
          },
          {
            headers,
            timeout: 30000
          }
        );

        if (response.data && response.data.choices?.[0]?.message?.content) {
          successCount++;
          capabilities.add(test.type);
        }
      } catch (error) {
        // Test failed, continue
        console.warn(`Test ${test.type} failed:`, error);
      }
    }

    const endTime = Date.now();
    const responseTime = Math.round((endTime - startTime) / testPrompts.length);
    
    // Calculate power score (0-100)
    const accuracyScore = (successCount / testPrompts.length) * 100;
    const speedScore = Math.max(0, 100 - (responseTime / 100)); // Faster = higher score
    const powerScore = Math.round((accuracyScore * 0.7) + (speedScore * 0.3));

    return {
      powerScore: Math.min(100, Math.max(0, powerScore)),
      responseTime,
      capabilities: Array.from(capabilities),
      accuracy: accuracyScore,
      reliability: successCount / testPrompts.length
    };
  } catch (error: any) {
    throw new Error(`Power measurement failed: ${error.message}`);
  }
}

/**
 * Register agent to PincerBay
 */
export async function registerToPincerBay(data: RegistrationData): Promise<RegistrationResponse> {
  try {
    const response = await axios.post(`${PINCERBAY_API}/souls/register`, {
      name: data.name,
      endpoint: data.endpoint,
      apiKey: data.apiKey,
      model: data.agentInfo.model,
      powerScore: data.powerMetrics.powerScore,
      responseTime: data.powerMetrics.responseTime,
      capabilities: data.powerMetrics.capabilities,
      metadata: {
        agentInfo: data.agentInfo,
        powerMetrics: data.powerMetrics,
        registeredAt: new Date().toISOString()
      }
    }, {
      timeout: 15000
    });

    return {
      soulId: response.data.id || response.data.soulId,
      status: response.data.status || 'registered'
    };
  } catch (error: any) {
    if (error.response) {
      throw new Error(`PincerBay registration failed: ${error.response.data?.message || error.response.statusText}`);
    }
    throw new Error(`PincerBay registration failed: ${error.message}`);
  }
}

export default {
  connectAgent,
  measurePower,
  registerToPincerBay
};
