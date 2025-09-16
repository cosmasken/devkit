import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs-extra';

export async function deploy(network: string) {
  console.log(`Deploying to ${network}...`);
  
  // Check if we're in a SomniaGames project
  const contractsPath = path.join(process.cwd(), 'contracts');
  if (!fs.existsSync(contractsPath)) {
    console.error('Error: No contracts directory found. Are you in a SomniaGames project?');
    process.exit(1);
  }

  // Check if hardhat is available
  if (!shell.which('npx')) {
    console.error('Error: npx not found. Please install Node.js and npm.');
    process.exit(1);
  }

  // Check for private key
  if (!process.env.PRIVATE_KEY) {
    console.error('Error: PRIVATE_KEY environment variable not set.');
    console.log('Please set your private key: export PRIVATE_KEY=your_private_key_here');
    process.exit(1);
  }

  console.log('Compiling contracts...');
  const compileResult = shell.exec('npx hardhat compile', { cwd: contractsPath, silent: false });
  if (compileResult.code !== 0) {
    console.error('Contract compilation failed!');
    process.exit(1);
  }

  console.log(`Connecting to ${network}...`);
  const deployResult = shell.exec(`npx hardhat run scripts/deploy.js --network ${network}`, { 
    cwd: contractsPath, 
    silent: false 
  });
  
  if (deployResult.code !== 0) {
    console.error('Deployment failed!');
    process.exit(1);
  }

  // Read deployment addresses if available
  const deploymentsPath = path.join(contractsPath, 'deployments.json');
  if (fs.existsSync(deploymentsPath)) {
    const deployments = fs.readJSONSync(deploymentsPath);
    console.log('\nDeployment successful!');
    console.log('\nContract Addresses:');
    Object.entries(deployments).forEach(([key, value]) => {
      if (key !== 'network' && key !== 'deployedAt') {
        console.log(`  ${key}: ${value}`);
      }
    });
  }

  console.log('\nNext steps:');
  console.log('  1. Update your frontend with these contract addresses');
  console.log('  2. Start your development server: npm run dev');
  console.log('  3. Test your contracts on the network');
}