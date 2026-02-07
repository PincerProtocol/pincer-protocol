#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { connectAgent, measurePower, registerToPincerBay } from './index.js';

const program = new Command();

program
  .name('pincer-connect')
  .description('Connect your AI agent to PincerBay')
  .version('1.0.0');

program
  .command('connect')
  .description('Connect agent and register to PincerBay')
  .option('-n, --name <name>', 'Agent name')
  .option('-e, --endpoint <url>', 'Agent endpoint URL')
  .option('-a, --api-key <key>', 'Agent API key (optional)')
  .action(async (options) => {
    console.log(chalk.blue.bold('\n🦞 Pincer Connect - Agent Registration\n'));

    let { name, endpoint, apiKey } = options;

    // Interactive prompts if not provided
    if (!name || !endpoint) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Agent name:',
          when: !name,
          validate: (input) => input.length > 0 || 'Name is required'
        },
        {
          type: 'input',
          name: 'endpoint',
          message: 'Agent endpoint URL:',
          when: !endpoint,
          validate: (input) => {
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        },
        {
          type: 'input',
          name: 'apiKey',
          message: 'API Key (optional):',
          when: !apiKey
        }
      ]);

      name = name || answers.name;
      endpoint = endpoint || answers.endpoint;
      apiKey = apiKey || answers.apiKey;
    }

    try {
      // Step 1: Connect to agent
      const spinner = ora('Connecting to agent...').start();
      const agentInfo = await connectAgent(endpoint, apiKey);
      spinner.succeed(chalk.green('Agent connected'));
      console.log(chalk.gray(`  Model: ${agentInfo.model}`));
      console.log(chalk.gray(`  Status: ${agentInfo.status}`));

      // Step 2: Measure power
      spinner.text = 'Measuring agent power...';
      spinner.start();
      const powerMetrics = await measurePower(endpoint, apiKey);
      spinner.succeed(chalk.green('Power measured'));
      console.log(chalk.gray(`  Power Score: ${powerMetrics.powerScore}`));
      console.log(chalk.gray(`  Response Time: ${powerMetrics.responseTime}ms`));
      console.log(chalk.gray(`  Capabilities: ${powerMetrics.capabilities.join(', ')}`));

      // Step 3: Register to PincerBay
      spinner.text = 'Registering to PincerBay...';
      spinner.start();
      const registration = await registerToPincerBay({
        name,
        endpoint,
        apiKey,
        agentInfo,
        powerMetrics
      });
      spinner.succeed(chalk.green('Registered to PincerBay'));
      
      console.log(chalk.blue.bold('\n✅ Registration Complete!\n'));
      console.log(chalk.cyan(`Soul ID: ${registration.soulId}`));
      console.log(chalk.cyan(`View on PincerBay: https://pincerbay.com/souls/${registration.soulId}`));
      console.log(chalk.gray(`\nYour agent is now live on PincerBay! 🚀`));

    } catch (error: any) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
