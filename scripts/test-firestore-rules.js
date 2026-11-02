import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import process from 'node:process'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const firebaseCli = join(projectRoot, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js')
const port = await getAvailablePort()
const configPath = join(tmpdir(), `convo-firebase-${process.pid}-${port}.json`)

await writeFile(configPath, JSON.stringify({
  firestore: {
    rules: join(projectRoot, 'firestore.rules'),
  },
  emulators: {
    firestore: {
      host: '127.0.0.1',
      port,
    },
    ui: {
      enabled: false,
    },
    singleProjectMode: true,
  },
}))

try {
  const child = spawn(process.execPath, [
    firebaseCli,
    'emulators:exec',
    '--config',
    configPath,
    '--project',
    'demo-convo-rules',
    '--only',
    'firestore',
    'vitest run src/firestore.rules.test.js',
  ], {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  })

  const exitCode = await new Promise((resolveExit, reject) => {
    child.once('error', reject)
    child.once('close', (code) => resolveExit(code ?? 1))
  })

  if (exitCode !== 0) process.exitCode = exitCode
} finally {
  await unlink(configPath)
}

async function getAvailablePort() {
  const server = createServer()
  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  const { port: availablePort } = server.address()
  await new Promise((resolveClose, reject) => {
    server.close((error) => (error ? reject(error) : resolveClose()))
  })
  return availablePort
}
