import fs from 'node:fs/promises';
import path from 'node:path';

export function artifactPathForRole(spec, role) {
  const root = spec.artifacts?.root || 'artifacts';
  return role.outputs?.map((output) => path.join(root, path.basename(output))) || [];
}

export function collectArtifactPlan(spec) {
  return (spec.roles || []).map((role) => ({
    role: role.name,
    outputs: artifactPathForRole(spec, role)
  }));
}

export async function ensureRuntimeDirs(baseDir, spec) {
  const artifactRoot = path.join(baseDir, spec.artifacts?.root || 'artifacts');
  const promptRoot = path.join(baseDir, 'prompts');
  await fs.mkdir(artifactRoot, { recursive: true });
  await fs.mkdir(promptRoot, { recursive: true });
  return { artifactRoot, promptRoot };
}

export async function writeArtifactStubs(baseDir, spec) {
  const plan = collectArtifactPlan(spec);
  const written = [];

  for (const item of plan) {
    for (const relativePath of item.outputs) {
      const absolutePath = path.join(baseDir, relativePath);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      const content = [
        `# ${item.role}`,
        '',
        '## summary',
        '- pending',
        '',
        '## completed work',
        '- pending',
        '',
        '## assumptions',
        '- pending',
        '',
        '## unresolved issues',
        '- pending',
        '',
        '## next handoff target',
        '- pending',
        ''
      ].join('\n');
      await fs.writeFile(absolutePath, content, 'utf8');
      written.push(absolutePath);
    }
  }

  return written;
}

export async function writeRolePrompts(baseDir, plan) {
  const promptDir = path.join(baseDir, 'prompts');
  await fs.mkdir(promptDir, { recursive: true });
  const written = [];

  for (const role of plan.roles || []) {
    const filePath = path.join(promptDir, `${role.name}.prompt.md`);
    await fs.writeFile(filePath, role.prompt + '\n', 'utf8');
    written.push(filePath);
  }

  const orchestratorPath = path.join(promptDir, 'orchestrator-summary.md');
  await fs.writeFile(orchestratorPath, (plan.orchestrator || '') + '\n', 'utf8');
  written.push(orchestratorPath);

  return written;
}
