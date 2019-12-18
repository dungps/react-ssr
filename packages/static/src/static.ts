import path from 'path';
import spawn from 'cross-spawn';

const defaultCommand = 'dev';
const commands = new Set([
  'build',
  defaultCommand,
]);

let cmd = process.argv[2];
let args: string[] = [];

if (commands.has(cmd)) {
  args = process.argv.slice(3);
} else {
  cmd = defaultCommand;
  args = process.argv.slice(2);
}

const defaultEnv = cmd === 'dev' ? 'development' : 'production';
process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv;

const cli = path.join(__dirname, `static-${cmd}.js`);

const startProcess = () => {
  const proc = spawn('node', [cli, ...args], { stdio: 'inherit' });
  proc.on('close', (code: number, signal: string) => {
    if (code !== null) {
      process.exit(code);
    }
    if (signal) {
      if (signal === 'SIGKILL') {
        process.exit(137);
      }
      process.exit(1);
    }
    process.exit(0);
  });
  proc.on('error', () => {
    process.exit(1);
  });
  return proc;
}

const proc = startProcess();

const wrapper = () => {
  if (proc) {
    proc.kill();
  }
}

process.on('SIGINT', wrapper);
process.on('SIGTERM', wrapper);
process.on('exit', wrapper);