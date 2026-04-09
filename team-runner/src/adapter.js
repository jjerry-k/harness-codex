import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

function buildExecutionPrompt(rolePrompt, artifactPath) {
  return [
    rolePrompt,
    '',
    'Execution mode: report-only.',
    'Do not modify files in the repository for this step.',
    'Return only a concise markdown report with these sections:',
    '- summary',
    '- completed work',
    '- assumptions',
    '- unresolved issues',
    '- next handoff target',
    '',
    `This report will be written to: ${artifactPath}`
  ].join('\n');
}

async function writeFallbackArtifact(roleName, artifactPath, reason, details = '') {
  const body = [
    `# ${roleName}`,
    '',
    '## summary',
    `- execution fallback: ${reason}`,
    '',
    '## completed work',
    '- no reliable codex output captured',
    '',
    '## assumptions',
    '- adapter wrote a fallback artifact so the workflow can continue',
    '',
    '## unresolved issues',
    `- ${reason}`,
    details ? `- ${details}` : null,
    '',
    '## next handoff target',
    '- orchestrator',
    ''
  ].filter(Boolean).join('\n');

  await fs.writeFile(artifactPath, body, 'utf8');
}

async function ensureOutputExists(roleName, artifactPath) {
  try {
    const existing = await fs.readFile(artifactPath, 'utf8');
    if (!existing.trim()) {
      await writeFallbackArtifact(roleName, artifactPath, 'empty-output');
      return false;
    }
    return true;
  } catch {
    await writeFallbackArtifact(roleName, artifactPath, 'missing-output');
    return false;
  }
}

export async function executeRole({ cwd, roleName, rolePrompt, artifactPath, timeoutMs = 90000 }) {
  const prompt = buildExecutionPrompt(rolePrompt, artifactPath);

  return new Promise((resolve) => {
    const child = spawn(
      'codex',
      ['exec', '--skip-git-repo-check', '-o', artifactPath, prompt],
      {
        cwd,
        env: { ...process.env, CI: '1' },
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', async (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      await writeFallbackArtifact(roleName, artifactPath, 'spawn-error', error.message);
      resolve({
        role: roleName,
        artifactPath,
        status: 'error',
        error: error.message,
        stdoutBytes: Buffer.byteLength(stdout),
        stderrBytes: Buffer.byteLength(stderr)
      });
    });

    child.on('close', async (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (timedOut) {
        await writeFallbackArtifact(roleName, artifactPath, 'timeout', `signal=${signal || 'none'}`);
        resolve({
          role: roleName,
          artifactPath,
          status: 'timeout',
          signal,
          stdoutBytes: Buffer.byteLength(stdout),
          stderrBytes: Buffer.byteLength(stderr)
        });
        return;
      }

      if (code !== 0) {
        await writeFallbackArtifact(roleName, artifactPath, 'non-zero-exit', `code=${code}, signal=${signal || 'none'}`);
        resolve({
          role: roleName,
          artifactPath,
          status: 'error',
          code,
          signal,
          stdoutBytes: Buffer.byteLength(stdout),
          stderrBytes: Buffer.byteLength(stderr)
        });
        return;
      }

      const hasRealOutput = await ensureOutputExists(roleName, artifactPath);
      resolve({
        role: roleName,
        artifactPath,
        status: hasRealOutput ? 'ok' : 'fallback',
        stdoutBytes: Buffer.byteLength(stdout),
        stderrBytes: Buffer.byteLength(stderr)
      });
    });
  });
}
