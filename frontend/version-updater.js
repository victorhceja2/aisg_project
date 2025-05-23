import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Versión actual
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Incrementar versión (por ejemplo para un fix/patch)
const newVersion = `${major}.${minor}.${patch + 1}`;

// Actualizar package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`Versión actualizada a: ${newVersion}`);