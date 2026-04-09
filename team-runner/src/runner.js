import path from 'node:path';
import {
  collectArtifactPlan,
  ensureRuntimeDirs,
  writeArtifactStubs,
  writeRolePrompts
} from './artifacts.js';
import { executeRole } from './adapter.js';
import { buildMergePlan, canMerge } from './merge.js';
import { compileRolePrompt, compileOrchestratorSummary } from './prompts.js';
import { buildValidationPlan, isDone } from './validate.js';

function roleExecutionOrder(roles) {
  const priority = (name) => {
    if (name === 'orchestrator') return 0;
    if (name === 'reviewer' || name === 'qa' || name === 'reviewer-qa') return 2;
    return 1;
  };

  return [...(roles || [])].sort((a, b) => priority(a.name) - priority(b.name));
}

function liteRoleFilter(role) {
  return role.name === 'orchestrator' || role.name === 'reviewer' || role.name === 'qa' || role.name === 'reviewer-qa';
}

export function buildExecutionPlan(spec) {
  return {
    orchestrator: compileOrchestratorSummary(spec),
    roles: (spec.roles || []).map((role) => ({
      name: role.name,
      prompt: compileRolePrompt(role, spec)
    })),
    artifacts: collectArtifactPlan(spec),
    merge: buildMergePlan(spec),
    validation: buildValidationPlan(spec)
  };
}

export async function runTeam(spec, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const plan = buildExecutionPlan(spec);
  const runtimeDirs = await ensureRuntimeDirs(baseDir, spec);
  const artifactsWritten = await writeArtifactStubs(baseDir, spec);
  const promptsWritten = await writeRolePrompts(baseDir, plan);

  return {
    status: 'mvp-dry-run',
    baseDir: path.resolve(baseDir),
    spawnDecision: spec.spawnDecision,
    runtimeDirs,
    artifactsWritten,
    promptsWritten,
    merge: canMerge(spec),
    validation: isDone(spec),
    note: 'This MVP now prepares prompts and artifact stubs. It does not yet spawn subagents automatically.'
  };
}

async function executePlan(plan, spec, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const artifactMap = new Map();
  for (const item of plan.artifacts || []) {
    artifactMap.set(item.role, item.outputs?.[0]);
  }

  const results = [];
  for (const role of roleExecutionOrder(plan.roles)) {
    const artifactRelativePath = artifactMap.get(role.name);
    if (!artifactRelativePath) continue;

    const artifactPath = path.join(baseDir, artifactRelativePath);
    const result = await executeRole({
      cwd: baseDir,
      roleName: role.name,
      rolePrompt: role.prompt,
      artifactPath,
      timeoutMs: options.timeoutMs
    });
    results.push(result);
  }

  const hasFailures = results.some((item) => item.status !== 'ok');

  return {
    status: hasFailures ? 'mvp-executed-with-fallbacks' : 'mvp-executed',
    baseDir: path.resolve(baseDir),
    spawnDecision: spec.spawnDecision,
    executedRoles: results,
    merge: buildMergePlan(spec),
    validation: buildValidationPlan(spec)
  };
}

export async function executeTeam(spec, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const plan = buildExecutionPlan(spec);
  await ensureRuntimeDirs(baseDir, spec);
  await writeArtifactStubs(baseDir, spec);
  await writeRolePrompts(baseDir, plan);

  const result = await executePlan(plan, spec, options);
  return {
    ...result,
    note: 'Roles were executed sequentially through Codex CLI in report-only mode. Automatic parallel spawning is not implemented yet.'
  };
}

export async function executeTeamLite(spec, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const fullPlan = buildExecutionPlan(spec);
  const litePlan = {
    ...fullPlan,
    roles: (fullPlan.roles || []).filter(liteRoleFilter),
    artifacts: (fullPlan.artifacts || []).filter((item) => liteRoleFilter({ name: item.role }))
  };

  await ensureRuntimeDirs(baseDir, spec);
  await writeArtifactStubs(baseDir, spec);
  await writeRolePrompts(baseDir, fullPlan);

  const result = await executePlan(litePlan, spec, options);
  return {
    ...result,
    mode: 'execute-lite',
    note: 'Only orchestrator/reviewer-style roles were executed to improve reliability. Builder roles were skipped in this lite mode.'
  };
}
