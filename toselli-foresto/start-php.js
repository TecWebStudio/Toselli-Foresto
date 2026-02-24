const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Find PHP executable
const candidates = [
  'php', // system PATH
  path.join(os.homedir(), 'scoop', 'apps', 'php', 'current', 'php.exe'),
  path.join(os.homedir(), 'scoop', 'shims', 'php.exe'),
  'C:\\php\\php.exe',
  'C:\\xampp\\php\\php.exe',
  'C:\\wamp64\\bin\\php\\php8.2.0\\php.exe',
];

const { execSync } = require('child_process');

let phpPath = null;
for (const candidate of candidates) {
  try {
    execSync(`"${candidate}" -v`, { stdio: 'pipe' });
    phpPath = candidate;
    break;
  } catch {
    // try next
  }
}

if (!phpPath) {
  console.error('❌ PHP non trovato! Installa PHP e assicurati sia nel PATH.');
  console.error('   Puoi installarlo con: scoop install php');
  process.exit(1);
}

console.log(`✅ PHP trovato: ${phpPath}`);
console.log('🚀 Avvio server PHP su http://localhost:8080...');

const php = spawn(phpPath, ['-S', 'localhost:8080', '-t', 'php-backend', 'php-backend/index.php'], {
  cwd: __dirname,
  stdio: 'inherit',
});

php.on('error', (err) => {
  console.error('Errore avvio PHP:', err.message);
  process.exit(1);
});

php.on('close', (code) => {
  process.exit(code);
});
