#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Directories
const contractsDir = path.join(__dirname, '../contracts');
const outputDir = path.join(__dirname, '../src/contracts');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to find imports
function findImports(importPath) {
    // Handle OpenZeppelin imports
    if (importPath.startsWith('@openzeppelin/')) {
        try {
            const resolvedPath = require.resolve(importPath);
            return {
                contents: fs.readFileSync(resolvedPath, 'utf8')
            };
        } catch (error) {
            console.error(`Could not resolve import: ${importPath}`);
            return { error: 'File not found' };
        }
    }

    // Handle local imports
    const fullPath = path.join(contractsDir, importPath);
    if (fs.existsSync(fullPath)) {
        return {
            contents: fs.readFileSync(fullPath, 'utf8')
        };
    }

    return { error: 'File not found' };
}

// Read contract files
const contractFiles = ['GameContract.sol', 'GameNFT.sol'];
const sources = {};

contractFiles.forEach(file => {
    const filePath = path.join(contractsDir, file);
    if (fs.existsSync(filePath)) {
        sources[file] = {
            content: fs.readFileSync(filePath, 'utf8')
        };
    } else {
        console.error(`Contract file not found: ${file}`);
        process.exit(1);
    }
});

// Compilation input
const input = {
    language: 'Solidity',
    sources,
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        },
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};

console.log('Compiling contracts...');

// Compile contracts
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

// Check for errors
if (output.errors) {
    output.errors.forEach(error => {
        if (error.severity === 'error') {
            console.error('Compilation error:', error.formattedMessage);
            process.exit(1);
        } else {
            console.warn('Compilation warning:', error.formattedMessage);
        }
    });
}

// Generate artifacts for each contract
Object.keys(output.contracts).forEach(sourceFile => {
    Object.keys(output.contracts[sourceFile]).forEach(contractName => {
        const contract = output.contracts[sourceFile][contractName];

        // Create artifact object
        const artifact = {
            contractName,
            abi: contract.abi,
            bytecode: contract.evm.bytecode.object,
            deployedBytecode: contract.evm.deployedBytecode?.object || '',
            sourceFile,
            compiler: {
                name: 'solc',
                version: solc.version()
            },
            compiledAt: new Date().toISOString()
        };

        // Write artifact file
        const artifactPath = path.join(outputDir, `${contractName}.json`);
        fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

        console.log(`✓ Compiled ${contractName} -> ${artifactPath}`);
    });
});

console.log('Contract compilation completed successfully!');