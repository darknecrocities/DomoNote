import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const isWindows = os.platform() === 'win32';

if (isWindows) {
  const batPath = path.join(root, 'scripts', 'setup-windows.bat');
  const child = spawn('cmd.exe', ['/c', batPath], {
    cwd: root,
    stdio: 'inherit'
  });
  child.on('exit', (code) => process.exit(code || 0));
} else {
  const shPath = path.join(root, 'start.sh');
  const child = spawn('bash', [shPath], {
    cwd: root,
    stdio: 'inherit'
  });
  child.on('exit', (code) => process.exit(code || 0));
}
