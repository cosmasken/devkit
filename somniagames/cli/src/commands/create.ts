// commands/create.ts
import * as fs from 'fs-extra';
import * as path from 'path';
import * as shell from 'shelljs';

export function createProject(name: string, template: string) {
  console.log(`Creating new SomniaGames project: ${name}`);
  
  // Create project directory
  const projectPath = path.join(process.cwd(), name);
  
  if (fs.existsSync(projectPath)) {
    console.error(`Error: Directory ${name} already exists!`);
    process.exit(1);
  }
  
  fs.mkdirSync(projectPath);
  
  // Copy template files
  const templatePath = path.join(__dirname, `../../templates/${template}-template`);
  
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template ${template} not found!`);
    process.exit(1);
  }
  
  console.log('Copying template files...');
  shell.cp('-R', path.join(templatePath, '*'), projectPath);
  
  // Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = fs.readJSONSync(packageJsonPath);
    packageJson.name = name;
    fs.writeJSONSync(packageJsonPath, packageJson, { spaces: 2 });
  }
  
  console.log(`
  Successfully created project ${name}!
  
  Next steps:
    cd ${name}
    npm install
    npm run dev
  `);
}