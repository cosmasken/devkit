import * as fs from 'fs-extra';
import * as path from 'path';
import * as shell from 'shelljs';

export async function createProject(name: string, template: string) {
  console.log(`Creating new SomniaGames project: ${name}`);
  
  // Create project directory
  const projectPath = path.join(process.cwd(), name);
  
  if (fs.existsSync(projectPath)) {
    console.error(`Error: Directory ${name} already exists!`);
    process.exit(1);
  }
  
  // Find template path relative to CLI location
  const cliDir = path.dirname(path.dirname(__dirname));
  const templatePath = path.join(cliDir, 'templates', `${template}-template`);
  
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template ${template} not found at ${templatePath}!`);
    console.log('Available templates: react');
    process.exit(1);
  }
  
  console.log('Creating project directory...');
  fs.mkdirSync(projectPath);
  
  console.log('Copying template files...');
  fs.copySync(templatePath, projectPath);
  
  // Copy contracts directory
  const contractsSourcePath = path.join(cliDir, 'contracts');
  const contractsDestPath = path.join(projectPath, 'contracts');
  if (fs.existsSync(contractsSourcePath)) {
    console.log('Copying smart contracts...');
    fs.copySync(contractsSourcePath, contractsDestPath);
  }
  
  // Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = fs.readJSONSync(packageJsonPath);
    packageJson.name = name;
    fs.writeJSONSync(packageJsonPath, packageJson, { spaces: 2 });
  }

  // Create .env.example file
  const envExamplePath = path.join(projectPath, '.env.example');
  const envContent = `# Private key for contract deployment
PRIVATE_KEY=your_private_key_here

# Contract addresses (will be filled after deployment)
REACT_APP_GAME_REGISTRY_ADDRESS=
REACT_APP_GAME_ASSET_ADDRESS=
REACT_APP_GAME_TOKEN_ADDRESS=

# Network configuration
REACT_APP_NETWORK_NAME=somnia-testnet
REACT_APP_RPC_URL=https://rpc.testnet.somnia.network
`;
  fs.writeFileSync(envExamplePath, envContent);

  console.log('Installing dependencies...');
  const installResult = shell.exec('npm install', { cwd: projectPath, silent: false });
  
  if (installResult.code !== 0) {
    console.warn('Warning: npm install failed. You may need to run it manually.');
  }

  // Install contract dependencies if contracts exist
  if (fs.existsSync(contractsDestPath)) {
    console.log('Installing contract dependencies...');
    const contractInstallResult = shell.exec('npm install', { cwd: contractsDestPath, silent: false });
    
    if (contractInstallResult.code !== 0) {
      console.warn('Warning: Contract dependencies installation failed.');
    }
  }

  console.log(`
✅ Successfully created project ${name}!

Next steps:
  cd ${name}
  
  # Set up environment variables
  cp .env.example .env
  # Edit .env and add your private key
  
  # Deploy contracts (optional)
  somniagames deploy --network somnia-testnet
  
  # Start development server
  npm run dev

📚 Documentation: https://github.com/your-repo/somniagames
🎮 Happy gaming on Somnia Network!
  `);
}