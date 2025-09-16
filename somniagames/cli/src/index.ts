#!/usr/bin/env node

import { Command } from 'commander';
import { createProject } from './commands/create';
import { deploy } from './commands/deploy';

const program = new Command();

program
  .name('somniagames')
  .description('CLI tool for SomniaGames platform')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new SomniaGames project')
  .argument('<project-name>', 'name of the project')
  .option('-t, --template <template>', 'template to use (default: react)', 'react')
  .action((name, options) => {
    createProject(name, options.template);
  });

program
  .command('deploy')
  .description('Deploy project to Somnia Testnet')
  .option('-n, --network <network>', 'network to deploy to (default: somnia-testnet)', 'somnia-testnet')
  .action((options) => {
    deploy(options.network);
  });

program.parse();