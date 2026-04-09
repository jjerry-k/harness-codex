import path from 'node:path';
import {
  collectArtifactPlan,
  ensureRuntimeDirs,
  writeArtifactStubs,
  writeRolePrompts
} from './artifacts.js';
import { buildMergePlan, canMerge } from './merge.js';
import { compileRolePrompt, compileOrchestratorSummary } from './prompts.js';
import { buildValidationPlan, isDone } from './validate.js';

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
