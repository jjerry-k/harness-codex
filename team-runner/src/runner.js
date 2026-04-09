import { collectArtifactPlan } from './artifacts.js';
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

export function runTeam(spec) {
  return {
    status: 'mvp-dry-run',
    spawnDecision: spec.spawnDecision,
    merge: canMerge(spec),
    validation: isDone(spec),
    note: 'This MVP currently prepares prompts and plans. It does not yet spawn subagents automatically.'
  };
}
