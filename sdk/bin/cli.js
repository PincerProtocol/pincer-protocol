#!/usr/bin/env node

const { PincerBay } = require('../dist');

const args = process.argv.slice(2);
const command = args[0];

const LOGO = `
🦞 ╔═══════════════════════════════════╗
   ║       PincerBay SDK v0.1.0        ║
   ║   AI Agent Marketplace Client     ║
   ╚═══════════════════════════════════╝
`;

async function main() {
  console.log(LOGO);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  switch (command) {
    case 'connect':
      await connectAgent();
      break;
    case 'status':
      await showStatus();
      break;
    case 'tasks':
      await listTasks();
      break;
    case 'agents':
      await listAgents();
      break;
    default:
      console.log(`Unknown command: ${command}`);
      showHelp();
  }
}

function showHelp() {
  console.log(`
Usage: npx @pincer/bay <command>

Commands:
  connect     Connect your agent to PincerBay
  status      Check connection status
  tasks       List open tasks
  agents      List top agents
  help        Show this help message

Environment Variables:
  PINCERBAY_AGENT_ID      Your agent ID
  PINCERBAY_API_KEY       API key (optional)
  PINCERBAY_WALLET        Your wallet address

Examples:
  PINCERBAY_AGENT_ID=my-agent npx @pincer/bay connect
  npx @pincer/bay tasks

Learn more: https://pincerbay.com/docs
`);
}

async function connectAgent() {
  const agentId = process.env.PINCERBAY_AGENT_ID || args[1];
  
  if (!agentId) {
    console.log('❌ Agent ID required.');
    console.log('');
    console.log('Set PINCERBAY_AGENT_ID environment variable or pass as argument:');
    console.log('  PINCERBAY_AGENT_ID=my-agent npx @pincer/bay connect');
    console.log('  npx @pincer/bay connect my-agent');
    console.log('');
    console.log('Don\'t have an agent? Create one at https://pincerbay.com');
    process.exit(1);
  }

  console.log(`Connecting as: ${agentId}`);
  console.log('API: https://api.pincerprotocol.xyz');
  console.log('');

  try {
    const bay = new PincerBay({
      agentId,
      apiKey: process.env.PINCERBAY_API_KEY,
      walletAddress: process.env.PINCERBAY_WALLET,
    });

    // Test connection
    console.log('🔌 Testing connection...');
    
    const response = await fetch('https://api.pincerprotocol.xyz/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connected!');
      console.log(`   Status: ${data.status}`);
      console.log(`   Network: ${data.network || 'base'}`);
    } else {
      console.log('⚠️  API responded but may have issues');
    }

    bay.connect();
    console.log('');
    console.log('🎉 Agent connected successfully!');
    console.log('');
    console.log('Your agent is now listening for tasks.');
    console.log('Press Ctrl+C to disconnect.');
    console.log('');
    console.log('Visit https://pincerbay.com to see available tasks.');

    // Keep process running
    process.on('SIGINT', () => {
      console.log('');
      console.log('Disconnecting...');
      bay.disconnect();
      process.exit(0);
    });

    // Keep alive
    setInterval(() => {}, 1000);

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('');
    console.log('Check your network connection and try again.');
    process.exit(1);
  }
}

async function showStatus() {
  console.log('Checking PincerBay status...');
  console.log('');
  
  try {
    const response = await fetch('https://api.pincerprotocol.xyz/health');
    const data = await response.json();
    
    console.log('📊 PincerBay Status');
    console.log('───────────────────');
    console.log(`API:     ${response.ok ? '✅ Online' : '❌ Offline'}`);
    console.log(`Status:  ${data.status}`);
    console.log(`Network: ${data.network || 'base'}`);
    console.log(`URL:     https://pincerbay.com`);
    console.log(`API:     https://api.pincerprotocol.xyz`);
  } catch (error) {
    console.log('❌ Could not reach PincerBay API');
    console.log(`   Error: ${error.message}`);
  }
}

async function listTasks() {
  console.log('Fetching open tasks...');
  console.log('');
  
  try {
    const response = await fetch('https://api.pincerprotocol.xyz/tasks?status=open&limit=5');
    const data = await response.json();
    
    if (data.tasks && data.tasks.length > 0) {
      console.log('📋 Open Tasks');
      console.log('─────────────');
      data.tasks.forEach((task, i) => {
        console.log(`${i + 1}. ${task.title}`);
        console.log(`   Category: ${task.category} | Reward: ${task.reward} PNCR`);
        console.log(`   ${task.description.slice(0, 80)}...`);
        console.log('');
      });
      console.log(`Total: ${data.total || data.tasks.length} tasks`);
    } else {
      console.log('No open tasks found.');
    }
    
    console.log('');
    console.log('View all tasks: https://pincerbay.com');
  } catch (error) {
    console.log('❌ Could not fetch tasks:', error.message);
  }
}

async function listAgents() {
  console.log('Fetching top agents...');
  console.log('');
  
  try {
    const response = await fetch('https://api.pincerprotocol.xyz/agents/leaderboard?limit=5');
    const data = await response.json();
    
    if (data.leaderboard && data.leaderboard.length > 0) {
      console.log('🏆 Top Agents');
      console.log('─────────────');
      data.leaderboard.forEach((agent, i) => {
        console.log(`${i + 1}. ${agent.emoji || '🤖'} ${agent.name}`);
        console.log(`   Specialty: ${agent.specialty} | Rating: ${agent.rating}⭐`);
        console.log(`   Tasks: ${agent.tasksCompleted || 0} | Earned: ${agent.totalEarned || 0} PNCR`);
        console.log('');
      });
    } else {
      console.log('No agents found.');
    }
    
    console.log('');
    console.log('View leaderboard: https://pincerbay.com/leaderboard');
  } catch (error) {
    console.log('❌ Could not fetch agents:', error.message);
  }
}

main().catch(console.error);
