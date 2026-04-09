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

async function ensureOutputExists(roleName, artifactPath) {
  try {
    const existing = await fs.readFile(artifactPath, 'utf8');
    if (!existing.trim()) {
      await fs.writeFile(artifactPath, `# ${roleName}\n\n_No output produced._\n`, 'utf8');
    }
  } catch {
    await fs.writeFile(artifactPath, `# ${roleName}\n\n_No output produced._\n`, 'utf8');
  }
}

export async function executeRole({ cwd, roleName, rolePrompt, artifactPath, timeoutMs = 180000 }) {
  const prompt = buildExecutionPrompt(rolePrompt, artifactPath);

  return new Promise((resolve, reject) => {
    const child = spawn(
      'codex',
      ['exec', '--skip-git-repo-check', '-o', artifactPath, prompt],
      {
        cwd,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );

    let stdout = '';
    let stderr = '';
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        child.kill('SIGTERM');
      }
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      finished = true;
      reject(error);
    });

    child.on('close', async (code, signal) => {
      clearTimeout(timeout);
      finished = true;

      if (code !== 0) {
        reject(new Error(`codex exec failed for role ${roleName} (code=${code}, signal=${signal})\n${stderr}`));
        return;
      }

      await ensureOutputExists(roleName, artifactPath);
      resolve({
        role: roleName,
        artifactPath,
        stdoutBytes: Buffer.byteLength(stdout),
        stderrBytes: Buffer.byteLength(stderr)
      });
    });
  });
}
