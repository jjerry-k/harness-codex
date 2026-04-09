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
import { buildSpawnPlan } from './spawn.js';
import { buildValidationPlan, isDone } from './validate.js';

function liteRoleFilter(role) {
  return role.name === 'orchestrator' || role.name === 'reviewer' || role.name === 'qa' || role.name === 'reviewer-qa';
}

export function buildExecutionPlan(spec) {
  const spawnPlan = buildSpawnPlan(spec, spec.roles || []);
  return {
    orchestrator: compileOrchestratorSummary(spec),
    roles: spawnPlan.roles.map((role) => ({
      ...role,
      prompt: compileRolePrompt(role, spec)
    })),
    artifacts: collectArtifactPlan(spec),
    merge: buildMergePlan(spec),
    validation: buildValidationPlan(spec),
    spawnPlan
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
    strategy: plan.spawnPlan?.strategy,
    waves: plan.spawnPlan?.waves,
    runtimeDirs,
    artifactsWritten,
    promptsWritten,
    merge: canMerge(spec),
    validation: isDone(spec),
    note: 'This dry run prepares prompts, artifact stubs, and a dependency-aware spawn plan before execution.'
  };
}

async function executePlan(plan, spec, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const artifactMap = new Map();
  for (const item of plan.artifacts || []) {
    artifactMap.set(item.role, item.outputs?.[0]);
  }

  const roleMap = new Map((plan.roles || []).map((role) => [role.name, role]));
  const waveResults = [];
  const results = [];

  for (const wave of plan.spawnPlan?.waves || []) {
    const readyRoles = wave.ready.map((name) => roleMap.get(name)).filter(Boolean);
    const inlineRoles = readyRoles.filter((role) => role.mode === 'inline');
    const subagentRoles = readyRoles.filter((role) => role.mode === 'subagent');
    const completed = [];

    for (const role of inlineRoles) {
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
      completed.push({ role: role.name, mode: 'inline', status: result.status });
    }

    const spawned = await Promise.all(subagentRoles.map(async (role) => {
      const artifactRelativePath = artifactMap.get(role.name);
      if (!artifactRelativePath) return null;
      const artifactPath = path.join(baseDir, artifactRelativePath);
      const result = await executeRole({
        cwd: baseDir,
        roleName: role.name,
        rolePrompt: role.prompt,
        artifactPath,
        timeoutMs: options.timeoutMs
      });
      results.push(result);
      return { role: role.name, mode: 'subagent', status: result.status };
    }));

    waveResults.push({
      index: wave.index,
      inline: wave.inline,
      subagents: wave.subagents,
      completed: [...completed, ...spawned.filter(Boolean)]
    });
  }

  const hasFailures = results.some((item) => item.status !== 'ok');

  return {
    status: hasFailures ? 'mvp-executed-with-fallbacks' : 'mvp-executed',
    baseDir: path.resolve(baseDir),
    spawnDecision: spec.spawnDecision,
    strategy: plan.spawnPlan?.strategy,
    waves: waveResults,
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
    note: 'Roles were executed through a dependency-aware runner. Inline roles stay in the parent flow, while eligible worker roles are spawned in parallel Codex subprocess waves.'
  };
}

export async function executeTeamLite(spec, options = {}) {
  const baseDir = options.baseDir || process.cwd();
  const fullPlan = buildExecutionPlan(spec);
  const litePlan = {
    ...fullPlan,
    roles: (fullPlan.roles || []).filter(liteRoleFilter),
    artifacts: (fullPlan.artifacts || []).filter((item) => liteRoleFilter({ name: item.role })),
    spawnPlan: {
      ...(fullPlan.spawnPlan || {}),
      roles: (fullPlan.spawnPlan?.roles || []).filter(liteRoleFilter),
      waves: (fullPlan.spawnPlan?.waves || []).map((wave) => ({
        ...wave,
        ready: wave.ready.filter((name) => liteRoleFilter({ name })),
        inline: wave.inline.filter((name) => liteRoleFilter({ name })),
        subagents: wave.subagents.filter((name) => liteRoleFilter({ name }))
      })).filter((wave) => wave.ready.length)
    }
  };

  await ensureRuntimeDirs(baseDir, spec);
  await writeArtifactStubs(baseDir, spec);
  await writeRolePrompts(baseDir, fullPlan);

  const result = await executePlan(litePlan, spec, options);
  return {
    ...result,
    mode: 'execute-lite',
    note: 'Only orchestrator/reviewer-style roles were executed in this lite dependency-aware mode. Builder roles were skipped for reliability.'
  };
}
