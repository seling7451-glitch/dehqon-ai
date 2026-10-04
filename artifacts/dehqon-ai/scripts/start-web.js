const { spawn } = require('child_process');

const command = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
const args = process.platform === 'win32'
  ? ['/c', 'pnpm', 'exec', 'expo', 'start', '--web', '--clear', '--port', process.env.PORT || '8083']
  : ['-lc', 'pnpm exec expo start --web --clear --port ' + (process.env.PORT || '8083')];

const proc = spawn(command, args, {
  cwd: __dirname + '/..',
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    EXPO_PUBLIC_MODEL_API_URL: process.env.EXPO_PUBLIC_MODEL_API_URL || 'http://127.0.0.1:8000',
  },
});

proc.on('exit', (code) => {
  process.exit(code ?? 0);
});
